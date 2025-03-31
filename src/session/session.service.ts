import { LogService } from '@log/log.service';
import {
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from '@nestjs/common';
import type { UserDatabase } from '@type/index';
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
		private memorySession: MemorySessionManager,
		private logService: LogService,
	) {}

	readonly context = 'SessionManagerService';

	createSession(payload: UserDatabase): string {
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
