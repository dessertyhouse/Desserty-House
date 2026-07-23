import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';
import { logAuditEvent, createAuditContext } from '@/lib/audit-log';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Configure Cloudinary
function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  return cloudinary;
}

/**
 * Middleware to verify admin authentication
 */
async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; response?: NextResponse }> {
  const sessionAuth = await verifyAdminSession();
  const headerPassword = request.headers.get('x-admin-password');
  const validPassword = headerPassword === process.env.ADMIN_DASHBOARD_PASSWORD;
  
  if (!sessionAuth && !validPassword) {
    return { 
      authorized: false, 
      response: NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    };
  }

  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP, RATE_LIMITS.adminOperations);
  
  if (!rateLimit.success) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429 }
      )
    };
  }

  return { authorized: true };
}

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

/**
 * GET /api/admin/posts - Fetch all posts
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) return auth.response!;

    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Posts fetch error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      posts: data || []
    });

  } catch (error) {
    console.error('Admin posts GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/posts - Create new post with image upload
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) return auth.response!;

    // Parse form data
    let title: string, description: string, kind: string, file: File | null;
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = String(formData.get('title') || '');
      description = String(formData.get('description') || '');
      kind = String(formData.get('kind') || 'offer');
      file = formData.get('image') as File | null;
    } else {
      const body = await request.json();
      title = body.title || '';
      description = body.description || '';
      kind = body.kind || 'offer';
      file = null;
      
      // If image is a URL (for external uploads), handle it
      if (body.image_url) {
        const { data, error } = await supabaseAdmin
          .from('posts')
          .insert({
            title,
            description,
            kind,
            image_url: body.image_url,
            cloudinary_public_id: body.cloudinary_public_id || '',
            is_published: true
          })
          .select()
          .single();

        if (error) throw error;

        await logAuditEvent({
          action: 'post_created',
          entity_type: 'post',
          entity_id: data.id,
          new_value: data,
          ...createAuditContext(request)
        });

        return NextResponse.json({ success: true, post: data });
      }
    }

    // Validate required fields
    if (!title.trim()) {
      return NextResponse.json(
        { error: 'Post title is required.' },
        { status: 400 }
      );
    }

    if (!description.trim()) {
      return NextResponse.json(
        { error: 'Post description is required.' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'Post image is required.' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Please upload a WebP, JPG, or PNG image.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Image must be smaller than 8 MB.' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const cloudinary = getCloudinary();
    
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'Desserty House/upcoming-posts',
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1200, crop: 'limit' }
          ],
          context: {
            alt: title,
            caption: description
          }
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Generate post code
    const postCode = `POST-${Date.now().toString(36).toUpperCase()}`;

    // Save to database
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title: title.trim(),
        description: description.trim(),
        kind,
        cloudinary_public_id: uploadResult.public_id,
        image_url: uploadResult.secure_url,
        post_code: postCode,
        is_published: true
      })
      .select()
      .single();

    if (error) {
      // Clean up uploaded image on database error
      await cloudinary.uploader.destroy(uploadResult.public_id);
      throw error;
    }

    // Log audit event
    await logAuditEvent({
      action: 'post_created',
      entity_type: 'post',
      entity_id: data.id,
      new_value: data,
      ...createAuditContext(request)
    });

    return NextResponse.json({
      success: true,
      post: data,
      message: 'Post published successfully!'
    });

  } catch (error) {
    console.error('Post upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload post. Please check your image and try again.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/posts - Update post
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const { id, title, description, is_published, kind } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required.' },
        { status: 400 }
      );
    }

    // Fetch current post for audit
    const { data: currentPost } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (is_published !== undefined) updates.is_published = is_published;
    if (kind !== undefined) updates.kind = kind;

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log audit event
    await logAuditEvent({
      action: 'post_updated',
      entity_type: 'post',
      entity_id: id,
      old_value: currentPost,
      new_value: data,
      ...createAuditContext(request)
    });

    return NextResponse.json({
      success: true,
      post: data
    });

  } catch (error) {
    console.error('Post update error:', error);
    return NextResponse.json(
      { error: 'Failed to update post.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/posts - Delete post and Cloudinary image
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) return auth.response!;

    let id: string;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      id = body.id;
    } else {
      const body = await request.json();
      id = body.id;
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required.' },
        { status: 400 }
      );
    }

    // Fetch post to get Cloudinary ID
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('cloudinary_public_id, title')
      .eq('id', id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found.' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    try {
      const cloudinary = getCloudinary();
      await cloudinary.uploader.destroy(post.cloudinary_public_id, {
        resource_type: 'image'
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Log audit event
    await logAuditEvent({
      action: 'post_deleted',
      entity_type: 'post',
      entity_id: id,
      old_value: { title: post.title, cloudinary_id: post.cloudinary_public_id },
      ...createAuditContext(request)
    });

    return NextResponse.json({
      success: true,
      message: 'Post and image deleted successfully.'
    });

  } catch (error) {
    console.error('Post delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post. Please try again.' },
      { status: 500 }
    );
  }
}
