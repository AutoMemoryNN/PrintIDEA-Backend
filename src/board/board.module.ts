import { BoardGateway } from '@board/board.gateway';
import { BoardRepository } from '@board/repository/board.repository';
import { Module } from '@nestjs/common';
import { SecurityModule } from '@security/security.module';
import { BoardController } from './board.controller';
import { BoardService } from './service/board.service';

@Module({
	imports: [SecurityModule, SecurityModule],
	providers: [BoardGateway, BoardService, BoardRepository],
	exports: [BoardService],
	controllers: [BoardController],
})
export class BoardModule {}
