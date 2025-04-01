import { ExecutionContext, createParamDecorator } from '@nestjs/common';

/**
 * Parameter decorator that extracts the user ID from the request session.
 *
 * @description
 * This decorator should be used on routes that are protected by authentication
 * mechanisms (e.g., middleware or guards) that populate the request session.
 * It retrieves the `id` field from the session object, providing direct access
 * to the authenticated user's ID.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@UserId() userId: string) {
 *   // userId contains the authenticated user's ID
 *   return `Your user id is: ${userId}`;
 * }
 * ```
 *
 * @returns The ID of the authenticated user from the session, or undefined if not available.
 */
export const UserId = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		return request.session?.id;
	},
);

/**
 * Parameter decorator that extracts the user role from the request session.
 *
 * @description
 * This decorator can only be used on routes that are protected by the authentication
 * guards defined in the security module. Using it on unprotected routes will
 * result in undefined values as the user session won't be available.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@UserRole() role: string) {
 *   // role contains the authenticated user's role
 *   return `Your role is: ${role}`;
 * }
 * ```
 *
 * @returns The role of the authenticated user from the session, or undefined if not available.
 */
export const UserRole = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		return request.session?.role;
	},
);
