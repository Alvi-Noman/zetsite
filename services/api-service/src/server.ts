import { env } from '@zetsite/config/validateEnv';
import app from './app.js';
import { connectDb } from './utils/db.js';

const PORT = Number(env.PORT) || 4001;

connectDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`api-service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
