import { LogService } from '@log/log.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { SessionManagerService } from '@session/session.service';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class SessionAuthMiddleware implements NestMiddleware {
	constructor(
		private sessionManager: SessionManagerService,
		private logService: LogService,
	) {}

	use(req: Request, res: Response, next: NextFunction): undefined | Response {
		const token = req.headers.authorization?.split(' ')[1];
		if (!token) {
			return res.status(401).send('Unauthorized');
		}

		if (!this.sessionManager.verifySession(token)) {
			this.logService.warn(`Token altered: ${token}`);
			return res
				.status(401)
				.send("This session was altered and wasn't created by us");
		}

		if (!this.sessionManager.hasSession(token)) {
			return res.status(401).send('Session expired or not found');
		}

		next();
	}
}
