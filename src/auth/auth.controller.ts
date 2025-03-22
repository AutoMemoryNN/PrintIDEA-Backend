import { AccessToken } from '@auth/auth.decorators';
import { AuthService } from '@auth/auth.service';
import { Controller, Delete, Get, Query } from '@nestjs/common';
import { SessionManagerService } from '@session/session.service';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private sessionManager: SessionManagerService,
	) {}

	@Get()
	login(
		@Query('provider') provider,
		@AccessToken() accessToken: string,
	): Promise<{ isNewUser: boolean; jwt: string }> {
		if (provider === 'google') {
			return this.authService.googleLogin(accessToken);
		}
		throw new Error('Provider not supported');
	}

	@Delete('logout')
	async logout(@AccessToken() token: string): Promise<{ message: string }> {
		// this verification should be done in a middleware layer
		if (!this.sessionManager.verifySession(token)) {
			throw new Error('Invalid session');
		}
		await this.sessionManager.removeSession(token);
		return { message: 'Session removed successfully' };
	}
}
