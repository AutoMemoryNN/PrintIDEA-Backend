import { Injectable } from '@nestjs/common';
import { SessionManagerService } from '@session/session.service';
import { UserDatabase, UserRole } from '@type/index';
import { UserService } from '@user/user.service';

@Injectable()
export class LoginService {
	constructor(
		private sessionManager: SessionManagerService,
		private userService: UserService,
	) {}

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

			console.log('Google response:', googleResponse);
			const googleData = await googleResponse.json();

			const googleUser = {
				sub: googleData.sub,
				email: googleData.email,
				name: googleData.name,
				givenName: googleData.given_name,
			};

			const { isNewUser, user } = await this.resolveUser(
				this.parseGoogleUserData(googleUser, UserRole.CLIENT),
			);

			const jwt = await this.sessionManager.createSession(user);

			return { isNewUser, jwt };
		} catch (error) {
			throw new Error(`Error obtaining Google token: ${error.message}`);
		}
	}

	private parseGoogleUserData(
		googleUser: {
			sub: string;
			email: string;
			name: string;
			givenName: string;
		},
		userRole: UserRole,
	): UserDatabase {
		return {
			id: googleUser.sub,
			email: googleUser.email,
			name: googleUser.name,
			alias: googleUser.givenName,
			role: userRole,
		};
	}

	private async resolveUser(userData: UserDatabase): Promise<{
		isNewUser: boolean;
		user: UserDatabase;
	}> {
		if (await this.userService.verifyUserByEmail(userData.email)) {
			const user = await this.userService.getUserByEmail(userData.email);
			return { isNewUser: false, user };
		}
		const newUser = await this.userService.createUser(userData);
		return { isNewUser: true, user: newUser };
	}
}
