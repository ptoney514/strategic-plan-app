/**
 * R2 Upload Worker
 *
 * Generates presigned URLs for direct browser uploads to Cloudflare R2.
 * The browser uploads directly to R2, keeping large files off your server.
 */

export interface Env {
  R2_BUCKET: R2Bucket;
  R2_PUBLIC_DOMAIN: string;
  ALLOWED_ORIGINS: string;
}

interface PresignRequest {
  filename: string;
  contentType: string;
  folder: 'district-logos' | 'school-logos';
}

interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

// Generate a unique key for the file
function generateKey(folder: string, filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || 'png';
  const uuid = crypto.randomUUID();
  return `${folder}/${uuid}.${ext}`;
}

// Check if origin is allowed
function isOriginAllowed(origin: string | null, allowedOrigins: string): boolean {
  if (!origin) return false;
  const allowed = allowedOrigins.split(',').map(o => o.trim());
  return allowed.includes(origin) || allowed.includes('*');
}

// CORS headers helper
function corsHeaders(origin: string | null, allowedOrigins: string): HeadersInit {
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && isOriginAllowed(origin, allowedOrigins)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    // POST /presign - Generate presigned upload URL
    if (request.method === 'POST' && url.pathname === '/presign') {
      try {
        const body = await request.json() as PresignRequest;
        const { filename, contentType, folder } = body;

        // Validate required fields
        if (!filename || !contentType || !folder) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: filename, contentType, folder' }),
            { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
          );
        }

        // Validate folder
        if (!['district-logos', 'school-logos'].includes(folder)) {
          return new Response(
            JSON.stringify({ error: 'Invalid folder. Must be district-logos or school-logos' }),
            { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
          );
        }

        // Validate content type (images only)
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
        if (!allowedTypes.includes(contentType)) {
          return new Response(
            JSON.stringify({ error: 'Invalid content type. Allowed: png, jpg, svg, webp' }),
            { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
          );
        }

        // Generate unique key
        const key = generateKey(folder, filename);

        // Create multipart upload to get presigned URL
        // R2 supports direct PUT uploads with presigned URLs
        const multipartUpload = await env.R2_BUCKET.createMultipartUpload(key, {
          httpMetadata: {
            contentType: contentType,
          },
        });

        // For simple uploads, we'll use direct PUT
        // The client will PUT directly to the R2 bucket URL
        const publicUrl = `https://${env.R2_PUBLIC_DOMAIN}/${key}`;

        const response: PresignResponse = {
          uploadUrl: `/upload/${key}`, // Client will POST to our worker
          publicUrl,
          key,
        };

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('Presign error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to generate upload URL' }),
          { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }
    }

    // POST /upload/:key - Handle the actual upload
    if (request.method === 'POST' && url.pathname.startsWith('/upload/')) {
      try {
        const key = url.pathname.replace('/upload/', '');

        if (!key) {
          return new Response(
            JSON.stringify({ error: 'Missing key parameter' }),
            { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
          );
        }

        // Get content type from request
        const contentType = request.headers.get('Content-Type') || 'application/octet-stream';

        // Read the file body
        const body = await request.arrayBuffer();

        // Validate file size (max 5MB for logos)
        const maxSize = 5 * 1024 * 1024;
        if (body.byteLength > maxSize) {
          return new Response(
            JSON.stringify({ error: 'File too large. Maximum size is 5MB' }),
            { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
          );
        }

        // Upload to R2
        await env.R2_BUCKET.put(key, body, {
          httpMetadata: {
            contentType: contentType.split(';')[0], // Remove charset if present
          },
        });

        const publicUrl = `https://${env.R2_PUBLIC_DOMAIN}/${key}`;

        return new Response(
          JSON.stringify({ success: true, publicUrl, key }),
          { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error('Upload error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to upload file' }),
          { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }
    }

    // DELETE /delete/:key - Delete a file
    if (request.method === 'DELETE' && url.pathname.startsWith('/delete/')) {
      try {
        const key = url.pathname.replace('/delete/', '');

        if (!key) {
          return new Response(
            JSON.stringify({ error: 'Missing key parameter' }),
            { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
          );
        }

        await env.R2_BUCKET.delete(key);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error('Delete error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete file' }),
          { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Health check
    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response(
        JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // 404 for other routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  },
};
