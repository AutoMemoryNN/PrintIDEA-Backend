import { Module } from '@nestjs/common';
import { MemorySessionManager } from '@session/session.repository';
import { SessionManagerService } from '@session/session.service';

@Module({
	providers: [SessionManagerService, MemorySessionManager],
	exports: [SessionManagerService, MemorySessionManager],
})
export class SessionModule {}
