import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const AccessToken = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();

		if (request.headers.authorization) {
			return request.headers.authorization.split(' ')[1];
		}

		return null;
	},
);
