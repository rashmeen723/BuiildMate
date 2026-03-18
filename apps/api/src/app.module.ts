import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ServicesModule } from './services/services.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigModule } from '@nestjs/config';
import { RentalsModule } from './rentals/rentals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      defaults: {
        from: process.env.EMAIL_FROM,
      },
      template: {
        adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    PrismaModule,
    AuthModule,
    AdminModule,
    ServicesModule,
    CloudinaryModule,
    RentalsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
