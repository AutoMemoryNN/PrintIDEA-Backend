import { Shape, ShapeDataMap } from '@board/board.types';
import { BoardStateDto, ShapeDto } from '@board/dto/board.dto';
import { BoardRepository } from '@board/repository/board.repository';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { IdService } from '@security/uuid.security';
import { BoardDatabase, ShapesDatabase, ShapesTypes } from '@type/index';

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

	async addShapeToBoard(boardId: string, shape: ShapeDto): Promise<ShapeDto> {
		// Implement shape addition logic here
		// For now, this is a placeholder implementation
		const board = await this.boardRepository.findBoardByIdLatest(boardId);
		if (!board) {
			throw new NotFoundException(`Board ${boardId} not found`);
		}

		// Add your shape creation logic here

		return shape;
	}

	/**
	 * Transforms a ShapesDatabase record into a domain Shape<T>.
	 * Throws if required shapeData properties are missing or invalid.
	 */
	databaseShapeToShape<T extends keyof ShapeDataMap>(
		record: ShapesDatabase,
	): Shape<T> {
		if (!record.id) {
			throw new BadRequestException('Shape id is missing');
		}
		if (!record.type) {
			throw new BadRequestException('Shape type is missing');
		}
		if (!record.shapeData || typeof record.shapeData !== 'object') {
			throw new BadRequestException('shapeData must be an object');
		}

		const data = record.shapeData as ShapeDataMap[T];

		switch (record.type) {
			case 'rectangle':
				for (const prop of ['x', 'y', 'width', 'height'] as const) {
					if (
						typeof (data as ShapeDataMap['rectangle'])[prop] !==
						'number'
					) {
						throw new BadRequestException(
							`Rectangle missing numeric ${prop}`,
						);
					}
				}
				break;
			case 'circle':
				if (
					typeof (data as ShapeDataMap['circle']).radius !== 'number'
				) {
					throw new BadRequestException(
						'Circle missing numeric radius',
					);
				}
				break;
			case 'line':
			case 'arrow':
			case 'scribble':
				if (
					!Array.isArray(
						(data as ShapeDataMap['line' | 'arrow' | 'scribble'])
							.points,
					)
				) {
					throw new BadRequestException(
						'Line/Arrow/Scribble missing points array',
					);
				}
				break;
			case 'text':
				for (const prop of [
					'x',
					'y',
					'text',
					'fontSize',
					'width',
					'padding',
				] as const) {
					if (
						(prop === 'text' &&
							typeof (data as ShapeDataMap['text'])[prop] !==
								'string') ||
						(prop !== 'text' &&
							typeof (data as ShapeDataMap['text'])[prop] !==
								'number')
					) {
						throw new BadRequestException(`Text missing ${prop}`);
					}
				}
				break;
			case 'note':
				for (const prop of [
					'x',
					'y',
					'width',
					'height',
					'padding',
					'text',
					'fontSize',
				] as const) {
					if (
						(prop === 'text' &&
							typeof (data as ShapeDataMap['note'])[prop] !==
								'string') ||
						(prop !== 'text' &&
							typeof (data as ShapeDataMap['note'])[prop] !==
								'number')
					) {
						throw new BadRequestException(`Note missing ${prop}`);
					}
				}
				break;
			default:
				throw new BadRequestException(
					`Unsupported shape type ${record.type}`,
				);
		}

		const domain: Shape<T> = {
			id: record.id,
			type: record.type as T,
			fillColor: record.fillColor,
			strokeColor: record.strokeColor,
			strokeWidth:
				typeof record.strokeWidth === 'string'
					? Number.parseFloat(record.strokeWidth)
					: record.strokeWidth,
			draggable: record.draggable,
			shapeData: data,
		};

		return domain;
	}

	/**
	 * Transforms a domain Shape<T> into a ShapesDatabase record.
	 * Performs minimal conversion since domain is already validated.
	 */
	toDatabase<T extends keyof ShapeDataMap>(
		boardId: string,
		shape: Shape<T>,
	): ShapesDatabase {
		if (!shape.id) {
			throw new BadRequestException('Shape id is missing');
		}
		return {
			id: shape.id,
			boardId: boardId,
			type: shape.type as ShapesTypes,
			fillColor: shape.fillColor,
			strokeColor: shape.strokeColor,
			strokeWidth: shape.strokeWidth,
			draggable: shape.draggable,
			shapeData: shape.shapeData,
		};
	}
}
