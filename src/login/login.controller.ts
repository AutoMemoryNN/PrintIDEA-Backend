import { AccessToken } from '@login/login.decorators';
import { LoginService } from '@login/login.service';
import {
	BadRequestException,
	Controller,
	Delete,
	Get,
	Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionManagerService } from '@session/session.service';

@ApiTags('login')
@Controller('login')
export class LoginController {
	constructor(
		private readonly loginService: LoginService,
		private readonly sessionManager: SessionManagerService,
	) {}

	@Get()
	@ApiOperation({
		summary: 'Login with Google or Microsoft',
	})
	login(
		@Query('provider') provider,
		@AccessToken() accessToken: string,
	): Promise<{ isNewUser: boolean; jwt: string }> {
		if (provider === 'google') {
			return this.loginService.googleLogin(accessToken);
		}
		if (provider === 'microsoft') {
			return this.loginService.microsoftLogin(accessToken);
		}
		throw new BadRequestException('Provider not supported');
	}

	@ApiOperation({
		summary: 'Logout from the application',
	})
	@Delete()
	async logout(@AccessToken() token: string): Promise<{ message: string }> {
		// this verification should be done in a middleware layer
		if (!this.sessionManager.verifySession(token)) {
			throw new BadRequestException(
				'Invalid token. Please log in again.',
			);
		}
		await this.sessionManager.removeSession(token);
		return { message: 'Session removed successfully' };
	}

	@Get('refresh')
	@ApiOperation({
		summary: 'Refresh the access token',
	})
	async refreshToken(@AccessToken() token: string): Promise<{ jwt: string }> {
		if (!this.sessionManager.verifySession(token)) {
			throw new BadRequestException(
				'Invalid token. Please log in again.',
			);
		}
		const newToken = await this.sessionManager.refreshSession(token);
		return { jwt: newToken };
	}
}
