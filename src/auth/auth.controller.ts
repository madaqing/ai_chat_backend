// 接收前端发来的请求
// 接收参数 → 交给 service → 返回结果给前端
import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error: any) {
      throw new HttpException(
        error.message || '注册失败',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error: any) {
      throw new HttpException(
        error.message || '登录失败',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
