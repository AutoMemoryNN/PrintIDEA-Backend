import { Controller, Get, Param } from '@nestjs/common';
import { ControllerResponse } from '@type/index';
import { BoardStateDto } from './dto/board.dto';
import { BoardService } from './service/board.service';

@Controller('board')
export class BoardController {
	constructor(private readonly boardService: BoardService) {}

	@Get(':id')
	async getBoardAndState(
		@Param('id') boardId: string,
	): Promise<ControllerResponse<BoardStateDto>> {
		return {
			data: await this.boardService.getBoardAndState(boardId),
			message: 'Board and state retrieved successfully',
		};
	}
}
