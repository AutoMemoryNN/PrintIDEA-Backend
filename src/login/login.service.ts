import { Injectable, Logger } from '@nestjs/common';
import { SessionManagerService } from '@session/session.service';
import { UserDatabase, UserRoles } from '@type/index';
import { UserService } from '@user/user.service';

@Injectable()
export class LoginService {
	private readonly logger = new Logger(LoginService.name);

	constructor(
		private readonly sessionManager: SessionManagerService,
		private readonly userService: UserService,
	) {}

	async googleLogin(
		accessToken: string,
	): Promise<{ isNewUser: boolean; jwt: string }> {
		if (!accessToken) {
			throw new Error('No access token provided');
		}

		try {
			this.logger.log('Making request to Google API');

			const googleResponse = await fetch(
				'https://www.googleapis.com/oauth2/v3/userinfo',
				{
					headers: { authorization: `Bearer ${accessToken}` },
				},
			);

			this.logger.log(
				`Google API response status: ${googleResponse.status}`,
			);

			if (!googleResponse.ok) {
				const errorText = await googleResponse.text();
				this.logger.error(`Google API error: ${errorText}`);

				throw new Error(
					`Error while validating Google token: ${googleResponse.statusText}`,
				);
			}

			const googleData = await googleResponse.json();
			this.logger.log('Google data received');

			const googleUser = {
				sub: googleData.sub,
				email: googleData.email,
				name: googleData.name,
				givenName: googleData.given_name,
			};

			const { isNewUser, user } = await this.resolveUser(
				this.parseGoogleUserData(googleUser, UserRoles.CLIENT),
			);

			const jwt = this.sessionManager.createSession(user);

			return { isNewUser, jwt };
		} catch (error) {
			this.logger.error(`Google login error: ${error}`);
		}
	}

	async microsoftLogin(
		accessToken: string,
	): Promise<{ isNewUser: boolean; jwt: string }> {
		if (!accessToken) {
			throw new Error('No access token provided');
		}

		try {
			this.logger.log('Making request to Microsoft Graph API');

			const microsoftResponse = await fetch(
				'https://graph.microsoft.com/v1.0/me',
				{
					headers: { authorization: `Bearer ${accessToken}` },
				},
			);

			this.logger.log(
				`Microsoft API response status: ${microsoftResponse.status}`,
			);

			if (!microsoftResponse.ok) {
				const errorText = await microsoftResponse.text();
				this.logger.error(`Microsoft API error: ${errorText}`);

				throw new Error(
					`Error while validating Microsoft token: ${microsoftResponse.statusText}`,
				);
			}

			const microsoftData = await microsoftResponse.json();
			this.logger.log('Microsoft data received:', microsoftData);

			const microsoftUser = {
				sub: microsoftData.id,
				email: microsoftData.mail || microsoftData.userPrincipalName,
				name: `${microsoftData.givenName || ''} ${microsoftData.surname || ''}`.trim(),
				givenName: microsoftData.givenName || microsoftData.displayName,
			};

			const { isNewUser, user } = await this.resolveUser(
				this.parseMicrosoftUserData(microsoftUser, UserRoles.CLIENT),
			);

			const jwt = this.sessionManager.createSession(user);

			return { isNewUser, jwt };
		} catch (error) {
			this.logger.error(`Microsoft login error: ${error}`);
		}
	}

	private parseGoogleUserData(
		googleUser: {
			sub: string;
			email: string;
			name: string;
			givenName: string;
		},
		userRole: UserRoles,
	): UserDatabase {
		return {
			id: googleUser.sub,
			email: googleUser.email,
			name: googleUser.name,
			alias: googleUser.givenName,
			role: userRole,
		};
	}

	private parseMicrosoftUserData(
		microsoftUser: {
			sub: string;
			email: string;
			name: string;
			givenName: string;
		},
		userRole: UserRoles,
	): UserDatabase {
		return {
			id: microsoftUser.sub,
			email: microsoftUser.email,
			name: microsoftUser.name,
			alias: microsoftUser.givenName,
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
