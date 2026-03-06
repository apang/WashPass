import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: dto.role,
        },
      });

      if (dto.role === UserRole.MEMBER) {
        await tx.member.create({
          data: {
            userId: user.id,
            fullName: dto.fullName,
          },
        });
      } else if (dto.role === UserRole.OPERATOR_ADMIN) {
        await tx.operator.create({
          data: {
            userId: user.id,
            businessName: dto.businessName || dto.fullName,
          },
        });
      }

      return user;
    });

    return { userId: user.id };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return { userId: user.id, email: user.email, role: user.role };
  }

  async login(user: { userId: string; email: string; role: string }) {
    const jti = randomUUID();

    const accessToken = this.jwtService.sign(
      { sub: user.userId, email: user.email, role: user.role, jti },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: '15m',
      },
    );

    const refreshToken = randomUUID();
    const refreshHash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.userId,
        token: refreshHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: {
        expiresAt: { gt: new Date() },
      },
    });

    let matchedToken = null;
    for (const stored of storedTokens) {
      const isMatch = await bcrypt.compare(refreshToken, stored.token);
      if (isMatch) {
        matchedToken = stored;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: matchedToken.userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Delete old refresh token
    await this.prisma.refreshToken.delete({
      where: { id: matchedToken.id },
    });

    // Issue new tokens
    return this.login({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async logout(jti: string, userId: string, tokenExp: number) {
    // Blocklist the access token JTI for its remaining lifetime
    const remainingTtl = Math.max(tokenExp - Math.floor(Date.now() / 1000), 0);
    if (remainingTtl > 0) {
      await this.redis.set(`bl:${jti}`, '1', remainingTtl);
    }

    // Delete all refresh tokens for this user
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
