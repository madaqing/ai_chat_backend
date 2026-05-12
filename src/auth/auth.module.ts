// 管理员 / 打包器
// 把 controller 和 service 捆在一起，让 NestJS 能识别并使用。
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your-secret-key-keep-it-safe',
      signOptions: { expiresIn: '7d' }, // accessToken 1小时
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
