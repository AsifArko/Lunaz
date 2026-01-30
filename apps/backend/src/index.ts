import { createApp } from './app.js';
import { getConfig } from './config/index.js';
import { connectDb } from './lib/db.js';

async function main() {
  const config = getConfig();
  await connectDb(config.MONGODB_URI);

  const app = createApp();
  app.listen(config.PORT, () => {
    console.log(`Backend listening on http://localhost:${config.PORT}`);
    console.log(`Health: http://localhost:${config.PORT}/health`);
    console.log(`API: http://localhost:${config.PORT}/api/v1`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
