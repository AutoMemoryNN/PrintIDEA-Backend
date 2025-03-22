import {
	Injectable,
	NestMiddleware,
	UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HeaderVerificationMiddleware implements NestMiddleware {
	use(req: Request, _res: Response, next: NextFunction): void {
		const headerName = 'authentication';
		if (!req.headers[headerName]) {
			throw new UnauthorizedException(
				`Missing required header: ${headerName}`,
			);
		}
		next();
	}
}
