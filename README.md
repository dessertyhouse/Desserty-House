# Desserty House - Refactored MVP

This repository has been refactored into a high-converting MVP e-commerce site for Desserty House, focusing on a lean launch for Phase 1.

## Key Features

- **Direct Ordering**: Customers order via WhatsApp or Email. A pre-filled message is generated automatically from the cart.
- **Admin CMS**: A protected `/admin` dashboard with:
  - **Feature Flags**: Toggle advanced automations (Emails, Payments, Tracking) ON/OFF. All default to **OFF**.
  - **Product & Category Management**: Full CRUD for the bakery menu.
  - **Review Management**: Approve or feature customer reviews.
  - **Site Settings**: Easy updates for contact info, hero banner, and announcement bar.
- **Premium Design**: Warm vanilla/cream palette with dark chocolate accents and elegant typography (Playfair Display & Inter).
- **Zustand Cart**: A smooth, mobile-friendly cart drawer.
- **Prisma & Supabase**: Robust database schema for scalability.

## Design System

- **Background**: `#FFFDF9` (Vanilla Cream)
- **Text**: `#2D221E` (Dark Chocolate)
- **Accents**: `#E07A5F` (Pastel Pink/Amber) & `#F4A261` (Amber)
- **Fonts**: Playfair Display (Serif) & Inter/Jakarta (Sans)

## Phase 1 Launch Strategy

The store is strictly "WhatsApp/Email Only". Automated payments and email notifications are coded but hidden behind Admin Feature Toggles until Phase 2 readiness.
