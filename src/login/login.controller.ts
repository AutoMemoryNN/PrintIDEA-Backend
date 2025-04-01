import { AccessToken } from '@login/login.decorators';
import { LoginService } from '@login/login.service';
import { Controller, Delete, Get, Query } from '@nestjs/common';
import { SessionManagerService } from '@session/session.service';

@Controller('login')
export class LoginController {
	constructor(
		private readonly loginService: LoginService,
		private readonly sessionManager: SessionManagerService,
	) {}

	@Get()
	login(
		@Query('provider') provider,
		@AccessToken() accessToken: string,
	): Promise<{ isNewUser: boolean; jwt: string }> {
		if (provider === 'google') {
			return this.loginService.googleLogin(accessToken);
		}
		throw new Error('Provider not supported');
	}

	@Delete()
	async logout(@AccessToken() token: string): Promise<{ message: string }> {
		// this verification should be done in a middleware layer
		if (!this.sessionManager.verifySession(token)) {
			throw new Error('Invalid session');
		}
		await this.sessionManager.removeSession(token);
		return { message: 'Session removed successfully' };
	}
}
