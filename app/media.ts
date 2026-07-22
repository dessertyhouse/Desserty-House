/** Uses a lightweight server redirect to the exact Cloudinary asset by folder and original filename.
 * No local product/showcase images are required in the Git repository. */
export function media(path:string){return `/api/media?path=${encodeURIComponent(path)}`}
