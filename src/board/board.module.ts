import { BoardGateway } from '@board/board.gateway';
import { Module } from '@nestjs/common';
import { SecurityModule } from '@security/security.module';
import { BoardController } from './board.controller';
import { BoardRepository } from './board.repository';
import { BoardService } from './board.service';

@Module({
	imports: [SecurityModule, SecurityModule],
	providers: [BoardGateway, BoardService, BoardRepository],
	exports: [BoardService],
	controllers: [BoardController],
})
export class BoardModule {}
