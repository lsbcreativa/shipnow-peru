import { MongoMemoryServer } from 'mongodb-memory-server';

// esto se completa en beforeAll, antes de eso queda undefined. los test
// files importan este "app" de aca en vez de importarlo directo de
// src/app.js, porque si lo hicieran directo las variables de entorno de
// src/config/env.config.js todavia no estarian seteadas (se cargan apenas
// se importa el modulo, y mocha carga TODOS los archivos de test antes
// de correr ningun hook).
export let app;

let mongod;

export const mochaHooks = {
  async beforeAll() {
    mongod = await MongoMemoryServer.create();

    process.env.NODE_ENV = 'test';
    process.env.PORT = '8081';
    process.env.MONGODB_URI = mongod.getUri('shipnow_test');

    const appModule = await import('../src/app.js');
    const { connectDB } = await import('../src/config/db.config.js');

    app = appModule.app;
    await connectDB();
  },

  // se limpia TODO antes de cada test, no solo entre archivos, para que
  // ningun test dependa de datos que dejo otro ni del orden en que corren.
  async beforeEach() {
    const mongoose = (await import('mongoose')).default;
    const collections = Object.values(mongoose.connection.collections);
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  },

  async afterAll() {
    const mongoose = (await import('mongoose')).default;
    await mongoose.connection.close();
    await mongod.stop();
  },
};
