import { BoardRepository } from '@board/board.repository';
import { Injectable } from '@nestjs/common';
import { IdService } from '@security/uuid.security';

@Injectable()
export class BoardService {
	constructor(
		private readonly boardRepository: BoardRepository,
		private readonly idService: IdService,
	) {}
}
