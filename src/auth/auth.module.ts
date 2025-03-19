import { AuthController } from '@auth/auth.controller';
import { Module } from '@nestjs/common';

@Module({
	controllers: [AuthController],
	providers: [],
})
export class AuthModule {}
