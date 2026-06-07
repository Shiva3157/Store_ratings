import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';
import { RatingsModule } from './ratings/ratings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'store_rating',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      // For demo purposes, we'll handle connection errors gracefully
      retryAttempts: 3,
      retryDelay: 3000,
    }),
    AuthModule,
    UsersModule,
    StoresModule,
    RatingsModule,
  ],
})
export class AppModule {}
