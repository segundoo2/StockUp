import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 10, // Máximo de 10 requisições por minuto na rota protegida
      },
    ]),
    UsersModule,
    AuthModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ThrottlerGuard],
})
export class AppModule {}
