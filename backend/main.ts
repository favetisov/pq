import 'reflect-metadata';

import { App } from './app';
import { env } from './env';

const app = new App();
app.init(env).then(() => {
  app.start(() => {
    console.log('api started');
  });
});
