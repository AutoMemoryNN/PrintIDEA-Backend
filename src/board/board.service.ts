import { BoardRepository } from '@board/board.repository';
import { Injectable } from '@nestjs/common';
import { IdService } from '@security/uuid.security';

@Injectable()
export class BoardService {
	constructor(
		private readonly boardRepository: BoardRepository,
		private readonly idService: IdService,
	) {}

	async createBoard(): Promise<string> {
		// Generate a unique ID for the board
		const id = await this.idService.generatePrefixedId('board_');

		// Create a 1000x1000 grid of zeros
		const rows = 1000;
		const cols = 1000;

		// Initialize the grid with zeros
		const grid: number[][] = Array(rows)
			.fill(0)
			.map(() => Array(cols).fill(0));

		// Convert the grid to a string format
		const data = JSON.stringify(grid);

		// Save the board using the repository
		await this.boardRepository.createBoard(id, data);

		// Return the board ID
		return id;
	}

	async getBoardArray(id: string): Promise<number[][]> {
		// Fetch the board data from the repository
		const boardData = await this.boardRepository.getBoard(id);

		if (!boardData) {
			throw new Error(`Board with ID ${id} not found`);
		}

		// Parse the stringified grid back to a 2D array
		const grid: number[][] = JSON.parse(boardData.data);

		return grid;
	}
}
