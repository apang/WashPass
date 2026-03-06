import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    // Support both REST and GraphQL
    try {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    } catch {
      return context.switchToHttp().getRequest();
    }
  }
}
