# R2 Upload Worker

Cloudflare Worker for handling file uploads to R2 storage.

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure wrangler.toml**:
   - Update `bucket_name` with your R2 bucket name
   - Update `R2_PUBLIC_DOMAIN` with your custom domain
   - Update `ALLOWED_ORIGINS` with your app's domains

3. **Deploy**:
   ```bash
   npm run deploy
   ```

## API Endpoints

### POST /presign

Get upload URL and prepare for file upload.

**Request:**

```json
{
  "filename": "logo.png",
  "contentType": "image/png",
  "folder": "district-logos"
}
```

**Response:**

```json
{
  "uploadUrl": "/upload/district-logos/uuid.png",
  "publicUrl": "https://assets.yourdomain.com/district-logos/uuid.png",
  "key": "district-logos/uuid.png"
}
```

### POST /upload/:key

Upload the file (send file as request body).

**Response:**

```json
{
  "success": true,
  "publicUrl": "https://assets.yourdomain.com/district-logos/uuid.png",
  "key": "district-logos/uuid.png"
}
```

### DELETE /delete/:key

Delete a file from R2.

### GET /health

Health check endpoint.

## Local Development

```bash
npm run dev
```

This starts a local dev server at `http://localhost:8787`.
