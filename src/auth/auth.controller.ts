import { AccessToken } from '@auth/auth.decorators';
import { AuthService } from '@auth/auth.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Get()
	login(
		@Query('provider') provider,
		@AccessToken() accessToken: string,
	): Promise<{ isNew: boolean; jwt: string }> {
		if (provider === 'google') {
			return this.authService.googleLogin(accessToken);
		}

		throw new Error('Provider not supported');
	}
}
