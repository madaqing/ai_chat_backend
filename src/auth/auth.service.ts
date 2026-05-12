// controller 把需求给我，我来真正干活、算逻辑、查数据库。
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    const exists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      throw new HttpException('邮箱已存在', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // 生成 accessToken（短有效期）
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '30m' }, // accessToken 30分钟
    );

    // 生成 refreshToken（长有效期）
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' }, // 7天
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new HttpException('密码错误', HttpStatus.UNAUTHORIZED);
    }

    // 生成 accessToken
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '2s' },
    );

    // 生成 refreshToken
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // 1. 验证 refreshToken 是否合法
      const payload = this.jwtService.verify(refreshToken);

      // 2. 根据用户ID查用户是否存在
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.UNAUTHORIZED);
      }

      // 3. 生成新的 token
      const newToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '30m' },
      );

      // 4. 生成新的 refreshToken
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '7d' },
      );

      // 5. 返回新令牌
      return {
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (err) {
      console.error('刷新令牌失败:', err);
      throw new HttpException(
        '登录已过期，请重新登录',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
