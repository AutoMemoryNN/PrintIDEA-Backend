import { LoginController } from '@login/login.controller';
import { LoginService } from '@login/login.service';
import { Module } from '@nestjs/common';
import { SessionModule } from '@session/session.module';
import { SessionManagerService } from '@session/session.service';

@Module({
	imports: [SessionModule],
	controllers: [LoginController],
	providers: [LoginService, SessionManagerService],
})
export class LoginModule {}
