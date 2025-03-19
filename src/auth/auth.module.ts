import { AuthController } from '@auth/auth.controller';
import { AuthService } from '@auth/auth.service';
import { Module } from '@nestjs/common';
import { SessionManagerService } from '@session/session.service';

@Module({
	controllers: [AuthController],
	providers: [AuthService, SessionManagerService],
})
export class AuthModule {}
