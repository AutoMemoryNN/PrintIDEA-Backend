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
					`Error while trying to validate google token: ${googleResponse.statusText}`,
				);
			}
			const googleUser = await googleResponse.json();
			const isNewUser = this.checkIfNewUser(googleUser.email); // TODO: First check if user exists in our database
			const jwt = await this.sessionManager.createSession({
				id: googleUser.sub,
				email: googleUser.email,
				role: 'user',
				username: googleUser.name,
				alias: googleUser.given_name,
			});

			return { isNewUser: isNewUser, jwt: jwt };
		} catch (error) {
			throw new Error(
				`Error while trying to obtain google token: ${error.message}`,
			);
		}
	}

	private checkIfNewUser(email: string): boolean {
		// Check if user exists in the database'
		return Boolean(email);
	}
}
