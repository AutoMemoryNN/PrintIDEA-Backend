import { LogModule } from '@log/log.module';
import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';
import { SessionAuthMiddleware } from '@security/security.middleware';
import { SessionModule } from '@session/session.module';

@Module({
	imports: [SessionModule, LogModule],
})
export class SecurityModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer
			.apply(SessionAuthMiddleware)
			.exclude({ path: 'login', method: RequestMethod.ALL })
			.exclude({ path: 'db-test', method: RequestMethod.ALL })
			.forRoutes('*');
	}
}
