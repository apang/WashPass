import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    // Try GraphQL context first
    try {
      const ctx = GqlExecutionContext.create(context);
      const req = ctx.getContext().req;
      if (req?.user) return req.user;
    } catch {
      // Not a GraphQL request
    }

    // Fall back to HTTP context
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
