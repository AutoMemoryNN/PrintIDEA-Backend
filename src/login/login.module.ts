import { LoginController } from '@login/login.controller';
import { HeaderVerificationMiddleware } from '@login/login.middleware';
import { LoginService } from '@login/login.service';
import { Module } from '@nestjs/common';
import { SessionModule } from '@session/session.module';
import { SessionManagerService } from '@session/session.service';
import { UserModule } from '@user/user.module';

@Module({
	imports: [SessionModule, UserModule],
	controllers: [LoginController],
	providers: [
		LoginService,
		SessionManagerService,
		HeaderVerificationMiddleware,
	],
})
export class LoginModule {}
