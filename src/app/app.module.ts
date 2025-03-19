import { AuthModule } from '@auth/auth.module';
import { Module } from '@nestjs/common';

@Module({
	imports: [AuthModule],
})
export class AppModule {}
