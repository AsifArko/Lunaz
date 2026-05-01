import { createApp } from './app.js';
import { getConfig } from './config/index.js';
import { connectDb } from './lib/db.js';
import { logger } from './lib/logger.js';

async function main() {
  const config = getConfig();
  await connectDb(config.MONGODB_URI);

  const app = createApp();
  app.listen(config.PORT, () => {
    logger.info(`Backend listening on http://127.0.0.1:${config.PORT}`);
    logger.info(`Health: http://127.0.0.1:${config.PORT}/health`);
    logger.info(`API: http://127.0.0.1:${config.PORT}/api/v1`);
  });
}

main().catch((err) => {
  logger.errorException(err, 'Backend failed to start');
  process.exit(1);
});
