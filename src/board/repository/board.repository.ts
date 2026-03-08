import { Schema } from '@database/database.schema';
import { Inject, Injectable } from '@nestjs/common';
import { BoardDatabase, ShapesDatabase } from '@type/index';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { and, desc, eq } from 'drizzle-orm';

@Injectable()
export class BoardRepository {
	constructor(
		@Inject('APP-DB')
		private readonly db: PostgresJsDatabase<typeof Schema>,
	) {}

	async createBoard(board: BoardDatabase): Promise<BoardDatabase> {
		const boards = Schema.boards;

		const result = await this.db
			.insert(boards)
			.values({
				id: board.id,
				width: board.width,
				height: board.height,
				baseVersion: board.baseVersion,
			})
			.returning({
				id: boards.id,
				width: boards.width,
				height: boards.height,
				baseVersion: boards.baseVersion,
			});

		return result[0];
	}

	async findBoardByIdAndVersion(
		id: string,
		version: number,
	): Promise<BoardDatabase> {
		const b = Schema.boards;
		const board = await this.db
			.select({
				id: b.id,
				width: b.width,
				height: b.height,
				baseVersion: b.baseVersion,
			})
			.from(b)
			.where(and(eq(b.id, id), eq(b.baseVersion, version)));

		if (!board || board.length !== 1) {
			return null;
		}
		return board[0];
	}

	async findBoardByIdLatest(id: string): Promise<BoardDatabase> {
		const b = Schema.boards;
		const board = await this.db
			.select({
				id: b.id,
				width: b.width,
				height: b.height,
				baseVersion: b.baseVersion,
			})
			.from(b)
			.where(eq(b.id, id))
			.orderBy(desc(b.baseVersion))
			.limit(1);

		if (!board || board.length !== 1) {
			return null;
		}
		return board[0];
	}

	async findShapesByBoardIdAndVersion(
		boardId: string,
		_version: number,
	): Promise<ShapesDatabase[]> {
		const s = Schema.shapes;

		const shapes = await this.db
			.select({
				id: s.id,
				boardId: s.boardId,
				type: s.type,
				fillColor: s.fillColor,
				strokeColor: s.strokeColor,
				strokeWidth: s.strokeWidth,
				draggable: s.draggable,
				shapeData: s.shapeData,
			})
			.from(s)
			.where(eq(s.boardId, boardId));

		if (!shapes) {
			return null;
		}
		return shapes;
	}

	async addShapeToBoard(
		shape: ShapesDatabase,
		boardId: string,
	): Promise<string> {
		const s = Schema.shapes;

		const result = await this.db
			.insert(s)
			.values({
				id: shape.id,
				boardId: boardId,
				type: shape.type,
				fillColor: shape.fillColor,
				strokeColor: shape.strokeColor,
				strokeWidth: shape.strokeWidth,
				draggable: shape.draggable,
				shapeData: shape.shapeData,
			})
			.returning({
				id: s.id,
			});

		return result[0].id;
	}
}
