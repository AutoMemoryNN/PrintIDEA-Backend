import { Injectable } from '@nestjs/common';
import type { UserSession } from '@type/index';
import { sign, verify } from 'jsonwebtoken';
import { MemorySessionManager } from './session.repository';

@Injectable()
export class SessionManagerService {
	constructor(private memorySession: MemorySessionManager) {}

	createSession(payload: UserSession): string {
		const privateKeyPem = process.env.PRIVATE_JWT_KEY;
		console.log('privateKeyPem', privateKeyPem);

		if (!privateKeyPem) {
			throw new Error('No private key found');
		}

		const token = sign(payload, privateKeyPem, {
			algorithm: 'RS256',
			expiresIn: '2h',
			subject: payload.id,
		});

		this.memorySession.addSession(token, payload);

		return token;
	}

	verifySession(token: string): UserSession {
		const publicKeyPem = process.env.PUBLIC_JWT_KEY;
		if (!publicKeyPem) {
			throw new Error('No public key found');
		}

		const decoded = verify(token, publicKeyPem, {
			algorithms: ['RS256'],
		}) as UserSession;
		return decoded;
	}

	async removeSession(token: string): Promise<void> {
		await this.memorySession.removeSession(token);
	}

	hasSession(token: string): boolean {
		return this.memorySession.hasSession(token);
	}
}
