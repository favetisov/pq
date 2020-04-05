import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { routes } from './routing';
import * as socketIo from 'socket.io';
import * as mongoose from 'mongoose';

export class App {
  static env: any;
  static io;
  express: express.Application;

  constructor() {
    this.express = express();
  }

  async init(env) {
    App.env = env;
    this.express.use(
      cors({
        allowedHeaders: 'Content-Type,Authorization,ClientLanguage,ClientUUID,FbToken,AppKey,CountryKey',
      }),
    );
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(bodyParser.json({ limit: '50mb' }));

    this.initRoutes();
    this.initConnection(env);
  }

  private async initRoutes() {
    routes.forEach((r) => {
      const handler = async (req: any, res: express.Response) => {
        try {
          const result = await r.handler(req);
          return res.send(result);
        } catch (e) {
          e.status = e.status || 500;
          const message = e.message || 'ERROR.SERVER_ERROR';
          res.status(e.status).send({ error: message });
          if (e.status == 500) {
            console.error(e, r.url);
          } else {
            console.warn(e.message + '    URL:' + r.url);
          }
        }
      };
      this.express[r.method]('/pq' + r.url, handler);
    });
  }

  private async initConnection(env) {
    await mongoose.connect(env.db, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  async start(callback) {
    console.log('starting api on port', App.env.apiPort, '...');
    const server = this.express.listen(App.env.apiPort, '0.0.0.0', callback);
    App.io = socketIo(server);
    App.io.on('connection', () => {
      console.log('connected');
    });
  }
}
