import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptors';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(
    session({
      secret: config.get('SESSION_SECRET'),
      // do not force save the session everytime; this means the session is saved only when it changed
      resave: false,
      // do not save the session if the user is not logged in/authenticated
      saveUninitialized: false,
      cookie: {
        maxAge: 10 * 60 * 60,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove unwanted objects (keys which are not included in the dto)
    }),
  );

  app.setGlobalPrefix('api/v1');

  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(config.get('PORT'));
}
bootstrap();
