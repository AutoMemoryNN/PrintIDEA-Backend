import { BoardRepository } from '@board/board.repository';
import { ShapeDataMap } from '@board/board.types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IdService } from '@security/uuid.security';
import { BoardDatabase } from '@type/index';
import { BoardStateDto, ShapeDto } from './dto/board.dto';

@Injectable()
export class BoardService {
	constructor(
		private readonly boardRepository: BoardRepository,
		private readonly idService: IdService,
	) {}

	async createBoard(): Promise<BoardDatabase> {
		const boardId = `board_${await this.idService.generateShortId()}`;
		return await this.boardRepository.createBoard({
			id: boardId,
			width: 5000,
			height: 5000,
			baseVersion: 0,
		});
	}

	async getBoardAndState(id: string): Promise<BoardStateDto> {
		const board = await this.boardRepository.findBoardByIdLatest(id);
		if (!board) {
			throw new NotFoundException(`Board ${id} not found`);
		}

		const shapes = await this.boardRepository.findShapesByBoardIdAndVersion(
			id,
			board.baseVersion,
		);

		const shapesSelected = shapes
			? shapes.map((s) => {
					return {
						id: s.id,
						type: s.type,
						fillColor: s.fillColor,
						strokeColor: s.strokeColor,
						strokeWidth: Number(s.strokeWidth),
						draggable: s.draggable,
						...(s.shapeData as ShapeDataMap[typeof s.type]),
					} as ShapeDto;
				})
			: [];

		return {
			id: board.id,
			width: board.width,
			height: board.height,
			baseVersion: board.baseVersion,
			shapes: shapesSelected,
		};
	}
}
