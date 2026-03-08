import { LogModule } from '@log/log.module';
import { Module } from '@nestjs/common';
import { MemorySessionManager } from '@session/session.repository';
import { SessionManagerService } from '@session/session.service';
import { UserModule } from '@user/user.module';

@Module({
	providers: [SessionManagerService, MemorySessionManager],
	exports: [SessionManagerService, MemorySessionManager],
	imports: [LogModule, UserModule],
})
export class SessionModule {}
