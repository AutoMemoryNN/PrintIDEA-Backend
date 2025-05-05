import { Controller, Get, Param } from '@nestjs/common';
import { ControllerResponse } from '@type/index';
import { BoardService } from './board.service';
import { BoardStateDto } from './dto/board.dto';

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
