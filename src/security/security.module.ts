import { LogModule } from '@log/log.module';
import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';
import { SessionAuthMiddleware } from '@security/security.middleware';
import { SessionModule } from '@session/session.module';
import { SessionManagerService } from '@session/session.service';
import { UserModule } from '@user/user.module';
import { IdService } from './uuid.security';

@Module({
	imports: [SessionModule, LogModule, UserModule],
	providers: [SessionManagerService, IdService],
	exports: [SessionManagerService, IdService],
})
export class SecurityModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer
			.apply(SessionAuthMiddleware)
			.exclude(
				{ path: 'login', method: RequestMethod.ALL },
				{ path: 'db-test', method: RequestMethod.ALL },
			)
			.forRoutes('*');
	}
}
