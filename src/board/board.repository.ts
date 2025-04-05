import { Schema } from '@database/database.schema';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { BoardDatabase } from '@type/index';

@Injectable()
export class BoardRepository {
	constructor(
		@Inject('APP-DB')
		private readonly db: PostgresJsDatabase<typeof Schema>,
	) {}

	async createBoard(boardId: string, data: string): Promise<void> {
		const boards = Schema.boards;
		await this.db.insert(boards).values({
			id: boardId,
			data,
		});
	}

	async getBoard(boardId: string): Promise<BoardDatabase | null> {
		const boards = Schema.boards;
		const result = await this.db
			.select({
				id: boards.id,
				data: boards.data,
			})
			.from(boards)
			.where(eq(boards.id, boardId))
			.limit(1);

		return result[0] || null;
	}

	async updateBoard(boardId: string, data: string): Promise<void> {
		const boards = Schema.boards;
		await this.db
			.update(boards)
			.set({ data })
			.where(eq(boards.id, boardId));
	}
}
