import type { UserSession } from '@type/index';

import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class SessionManagerService {
	createSession(payload: UserSession): Promise<string> {
		const privateKeyPem = process.env.PRIVATE_JWT_KEY;
		if (!privateKeyPem) {
			throw new Error('No private key found');
		}

		const token = sign(payload, privateKeyPem, {
			algorithm: 'RS256',
			expiresIn: '2h',
			subject: payload.id,
		});

		return Promise.resolve(token);
	}

	verifySession(token: string): Promise<UserSession> {
		const publicKeyPem = process.env.PUBLIC_JWT_KEY;
		if (!publicKeyPem) {
			throw new Error('No public key found');
		}

		const decoded = verify(token, publicKeyPem, {
			algorithms: ['RS256'],
		}) as UserSession;

		return Promise.resolve(decoded);
	}
}
