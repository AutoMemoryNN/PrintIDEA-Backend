import { Injectable } from '@nestjs/common';
import type { UserSession } from '@type/index';

@Injectable()
export class MemorySessionManager {
	private sessions: Map<string, UserSession>;

	constructor() {
		this.sessions = new Map();
	}

	hasSession(token: string): boolean {
		return this.sessions.has(token);
	}

	addSession(token: string, sessionData: UserSession): void {
		this.sessions.set(token, sessionData);
	}

	getSession(token: string): UserSession | null {
		return this.sessions.get(token) || null;
	}

	removeSession(token: string): void {
		this.sessions.delete(token);
	}
}
