import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'dev-jwt-secret',
    });
  }

  async validate(payload: JwtPayload) {
    // Check if token JTI is blocklisted
    const jtiBlocked = await this.redis.get(`bl:${payload.jti}`);
    if (jtiBlocked) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Check if user is blocklisted (staff removal)
    const userBlocked = await this.redis.get(`bl:user:${payload.sub}`);
    if (userBlocked) {
      throw new UnauthorizedException('User session invalidated');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
    };
  }
}
