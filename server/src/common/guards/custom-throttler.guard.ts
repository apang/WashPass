import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.userId || req.ip;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip throttling for health checks
    const request = context.switchToHttp().getRequest();
    if (request.url === '/health') return true;
    return super.canActivate(context);
  }
}
