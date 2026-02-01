import { createApp } from './app.js';
import { getConfig } from './config/index.js';
import { connectDb } from './lib/db.js';

async function main() {
  const config = getConfig();
  await connectDb(config.MONGODB_URI);

  const app = createApp();
  app.listen(config.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${config.PORT}`);
    // eslint-disable-next-line no-console
    console.log(`Health: http://localhost:${config.PORT}/health`);
    // eslint-disable-next-line no-console
    console.log(`API: http://localhost:${config.PORT}/api/v1`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
