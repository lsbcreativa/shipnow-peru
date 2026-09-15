import { app } from './app.js';
import { config } from './config/index.js';
import { connectDB } from './config/db.config.js';

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`Servidor de ShipNow Peru corriendo en el puerto ${config.port}`);
  });
};

startServer();
