import { Injectable } from '@nestjs/common';
import { SessionManagerService } from '@session/session.service';

@Injectable()
export class AuthService {
	constructor(private sessionManager: SessionManagerService) {}

	async googleLogin(
		accessToken: string,
	): Promise<{ isNewUser: boolean; jwt: string }> {
		if (!accessToken) {
			throw new Error('No access token provided');
		}

		try {
			const googleResponse = await fetch(
				'https://www.googleapis.com/oauth2/v3/userinfo',
				{
					headers: { authorization: `Bearer ${accessToken}` },
				},
			);

			if (!googleResponse.ok) {
				throw new Error(
					`Error while validating Google token: ${googleResponse.statusText}`,
				);
			}

			const googleUser = await googleResponse.json();
			const isNewUser = this.checkIfNewUser(googleUser.email);

			const jwt = await this.sessionManager.createSession({
				id: googleUser.sub,
				email: googleUser.email,
				role: 'user',
				username: googleUser.name,
				alias: googleUser.given_name,
			});

			return { isNewUser, jwt };
		} catch (error) {
			throw new Error(`Error obtaining Google token: ${error.message}`);
		}
	}

	private checkIfNewUser(email: string): boolean {
		return Boolean(email);
	}
}
