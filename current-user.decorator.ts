import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Récupère l'utilisateur authentifié injecté par JwtAuthGuard dans req.user.
 * Usage : findMyListings(@CurrentUser() user: AuthenticatedUser)
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
