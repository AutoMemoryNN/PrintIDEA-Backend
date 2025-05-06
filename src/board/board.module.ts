import { BoardController } from '@board/board.controller';
import { BoardGateway } from '@board/board.gateway';
import { BoardRepository } from '@board/repository/board.repository';
import { InMemoryBoardSession } from '@board/repository/boardSession.repository';
import { BoardService } from '@board/service/board.service';
import { LogModule } from '@log/log.module';
import { Module } from '@nestjs/common';
import { SecurityModule } from '@security/security.module';

@Module({
	imports: [SecurityModule, LogModule],
	providers: [
		BoardGateway,
		BoardService,
		BoardRepository,
		InMemoryBoardSession,
	],
	exports: [BoardService],
	controllers: [BoardController],
})
export class BoardModule {}
