import { BoardGateway } from '@board/board.gateway';
import { Module } from '@nestjs/common';
import { SecurityModule } from '@security/security.module';
import { BoardRepository } from './board.repository';
import { BoardService } from './board.service';

@Module({
	imports: [SecurityModule],
	providers: [BoardGateway, BoardService, BoardRepository],
	exports: [BoardService],
})
export class BoardModule {}
