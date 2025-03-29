import { LogService } from '@log/log.service';
import { Injectable } from '@nestjs/common';
import type { UserSession } from '@type/index';
@Injectable()
export class MemorySessionManager {
	private sessions: Map<string, UserSession>;

	readonly context = 'MemorySessionManager';

	constructor(private logService: LogService) {
		this.sessions = new Map();
	}

	hasSession(token: string): boolean {
		return this.sessions.has(token);
	}

	addSession(token: string, sessionData: UserSession): void {
		this.logService.log(`Adding session for token ${token}`, this.context);
		this.sessions.set(token, sessionData);
	}

	getSession(token: string): UserSession | null {
		return this.sessions.get(token) || null;
	}

	removeSession(token: string): void {
		this.logService.log(
			`Removing session for token ${token}`,
			this.context,
		);
		this.sessions.delete(token);
	}
}
