# Lunaz — Deploy to Fly.io

This project deploys **backend**, **web**, and **manage** as a single Fly.io app using the root `Dockerfile`. Node serves everything on port 8080: the web app at `/`, the admin panel at `/manage`, and the API at `/api`.

## Prerequisites

- [Fly CLI](https://fly.io/docs/hub/cli/) installed (`brew install flyctl` or see [fly.io/docs](https://fly.io/docs))
- Logged in: `fly auth login`

## First-time setup

1. **Create the app** (if you haven’t already):

   ```bash
   fly launch
   ```

   When prompted for a Dockerfile, the root `Dockerfile` is used automatically.

2. **Set required secrets** (backend needs these):

   ```bash
   fly secrets set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/lunaz"
   fly secrets set JWT_SECRET="your-super-secret-key-min-32-characters-long"
   ```

3. **Optional secrets** (for production):
   - `FRONTEND_WEB_URL` – e.g. `https://lunaz.fly.dev`
   - `FRONTEND_MANAGE_URL` – e.g. `https://lunaz.fly.dev/manage`
   - S3: `S3_BUCKET`, `S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - Payment/Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - Payment/SSLCommerz: `API_URL`, `SSLCOMMERZ_*`

   If you don’t set the frontend URLs, the app still works; set them if you need strict CORS or use a custom domain.

## Deploy

From the repo root:

```bash
fly deploy
```

Build and release will use the root `Dockerfile` and `fly.toml`.

## URLs after deploy

- **Web (storefront):** https://lunaz.fly.dev/
- **Admin panel:** https://lunaz.fly.dev/manage
- **API:** https://lunaz.fly.dev/api/v1
- **Health:** https://lunaz.fly.dev/health

(Replace `lunaz` with your Fly app name if different.)

## Build args (optional)

To override the API URL used by the frontends at build time (e.g. for a custom domain):

```bash
fly deploy --build-arg VITE_API_URL=https://your-app.fly.dev/api/v1
```

By default the frontends use the relative path `/api/v1`, which works when served from the same host.

## Troubleshooting

- **App won’t start:** Check `fly logs`. Ensure `MONGODB_URI` and `JWT_SECRET` are set.
- **502 / API errors:** Check `fly logs` for startup errors. Ensure `MONGODB_URI` and `JWT_SECRET` are set. The app is a single Node process; if it fails to start, the whole service returns 502.
- **Admin panel 404:** Use the trailing slash: `https://your-app.fly.dev/manage/`.
