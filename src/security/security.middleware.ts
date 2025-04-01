import { LogService } from '@log/log.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { SessionManagerService } from '@session/session.service';
import { UserDatabase } from '@type/index';
import { NextFunction, Request, Response } from 'express';

// TODO: find a better place for this type definition
declare global {
	namespace Express {
		interface Request {
			session?: UserDatabase;
		}
	}
}

@Injectable()
export class SessionAuthMiddleware implements NestMiddleware {
	constructor(
		private readonly sessionManager: SessionManagerService,
		private logService: LogService,
	) {}

	readonly context = 'SessionAuthMiddleware';

	use(req: Request, res: Response, next: NextFunction): undefined | Response {
		if (!req.headers.authorization?.startsWith('Bearer ')) {
			this.logService.error(
				'Authorization header is missing or invalid',
				this.context,
			);
			return res.status(401).send('Unauthorized');
		}
		const token = req.headers.authorization?.split(' ')[1];
		if (!token) {
			this.logService.error('No token provided', this.context);
			return res.status(401).send('Unauthorized');
		}

		const session = this.sessionManager.verifySession(token);

		if (!session) {
			return res
				.status(401)
				.send("This session was altered and wasn't created by us");
		}

		if (
			!this.sessionManager.hasSession(token) &&
			process.env.NODE_ENV !== 'dev'
		) {
			return res.status(401).send('Session expired or not found');
		}

		req.session = session;

		next();
	}
}
