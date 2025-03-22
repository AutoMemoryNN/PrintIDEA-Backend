import { AuthController } from '@auth/auth.controller';
import { AuthService } from '@auth/auth.service';
import { Module } from '@nestjs/common';
import { SessionModule } from '@session/session.module';
import { SessionManagerService } from '@session/session.service';

@Module({
	imports: [SessionModule],
	controllers: [AuthController],
	providers: [AuthService, SessionManagerService],
})
export class AuthModule {}
