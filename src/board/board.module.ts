import { BoardController } from '@board/board.controller';
import { BoardGateway } from '@board/board.gateway';
import { STATE_REPOSITORY, STATE_SERVICE } from '@board/board.tokens';
import { BoardRepository } from '@board/repository/board.repository';
import { InMemoryBoardSession } from '@board/repository/boardSession.repository';
import { InMemoryStateRepository } from '@board/repository/state.repository';
import { BoardService } from '@board/service/board.service';
import { BoardSessionService } from '@board/service/boardSession.service';
import { StateService } from '@board/service/state.service';
import { LogModule } from '@log/log.module';
import { Module } from '@nestjs/common';
import { OrganizationModule } from '@org/organization.module';
import { SecurityModule } from '@security/security.module';

@Module({
	imports: [SecurityModule, LogModule, OrganizationModule],
	providers: [
		BoardGateway,
		BoardService,
		BoardRepository,
		InMemoryBoardSession,
		BoardSessionService,
		{
			provide: STATE_SERVICE,
			useClass: StateService,
		},
		{
			provide: STATE_REPOSITORY,
			useClass: InMemoryStateRepository,
		},
	],
	exports: [BoardService, STATE_SERVICE, STATE_REPOSITORY],
	controllers: [BoardController],
})
export class BoardModule {}
