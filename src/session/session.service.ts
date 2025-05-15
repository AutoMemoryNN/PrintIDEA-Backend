import { LogService } from '@log/log.service';
import {
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from '@nestjs/common';
import type { UserDatabase } from '@type/index';
import { UserService } from '@user/user.service';
import {
	JsonWebTokenError,
	NotBeforeError,
	TokenExpiredError,
	sign,
	verify,
} from 'jsonwebtoken';
import { MemorySessionManager } from './session.repository';

@Injectable()
export class SessionManagerService {
	constructor(
		private readonly memorySession: MemorySessionManager,
		private readonly logService: LogService,
		private readonly userService: UserService,
	) {}

	readonly context = 'SessionManagerService';

	async createSession(userId: string): Promise<string> {
		const privateKeyPem = process.env.PRIVATE_JWT_KEY;

		if (!privateKeyPem) {
			this.logService.fatal(
				'PRIVATE_JWT_KEY is not defined.',
				this.context,
			);
			throw new InternalServerErrorException(
				'Internal server error: missing private key.',
			);
		}

		const payload = await this.userService.getUserById(userId);

		try {
			const expiresIn =
				process.env.NODE_ENV === 'production' ? '1h' : '5h';

			const token = sign(payload, privateKeyPem, {
				algorithm: 'RS256',
				expiresIn: expiresIn,
				subject: payload.id,
			});

			this.memorySession.addSession(token, payload);

			return token;
		} catch (error) {
			this.logService.error(
				`Error signing token: ${error.message}`,
				this.context,
			);
			throw new InternalServerErrorException('Failed to create session.');
		}
	}

	verifySession(token: string): UserDatabase {
		const publicKeyPem = process.env.PUBLIC_JWT_KEY;
		if (!publicKeyPem) {
			this.logService.fatal(
				'PUBLIC_JWT_KEY is not defined.',
				this.context,
			);
			throw new InternalServerErrorException(
				'Internal server error: missing public key.',
			);
		}

		try {
			const decoded = verify(token, publicKeyPem, {
				algorithms: ['RS256'],
			}) as UserDatabase;

			return decoded;
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				this.logService.warn(
					`Session expired: ${error.message}`,
					this.context,
				);
				throw new UnauthorizedException('Session expired.');
			}
			if (error instanceof JsonWebTokenError) {
				this.logService.warn(
					`Invalid JWT: ${error.message}`,
					this.context,
				);
				throw new UnauthorizedException('Invalid session token.');
			}
			if (error instanceof NotBeforeError) {
				this.logService.warn(
					`JWT not active yet: ${error.message}`,
					this.context,
				);
				throw new UnauthorizedException(
					'Session token not active yet.',
				);
			}
			this.logService.error(
				`Unknown JWT error: ${error.message}`,
				this.context,
			);
			throw new InternalServerErrorException(
				'Unexpected token validation error.',
			);
		}
	}

	async refreshSession(token: string): Promise<string> {
		const publicKeyPem = process.env.PUBLIC_JWT_KEY;

		if (!publicKeyPem) {
			this.logService.fatal(
				'PUBLIC_JWT_KEY is not defined.',
				this.context,
			);
			throw new InternalServerErrorException(
				'Internal server error: missing public key.',
			);
		}
		try {
			const decoded = verify(token, publicKeyPem, {
				algorithms: ['RS256'],
			}) as UserDatabase;

			const newToken = await this.createSession(decoded.id);
			this.removeSession(token);

			return newToken;
		} catch (error) {
			this.logService.error(
				`Error refreshing session: ${error.message}`,
				this.context,
			);
			throw new InternalServerErrorException(
				'Failed to refresh session.',
			);
		}
	}

	async removeSession(token: string): Promise<void> {
		try {
			await this.memorySession.removeSession(token);
		} catch (error) {
			this.logService.error(
				`Failed to remove session: ${error.message}`,
				this.context,
			);
			throw new InternalServerErrorException('Failed to remove session.');
		}
	}

	hasSession(token: string): boolean {
		return this.memorySession.hasSession(token);
	}
}
