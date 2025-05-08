import { Board, DeltaOperation } from '@board/board.types';
import { BoardStateDto } from '@board/dto/board.dto';
import { IStateService } from '@board/interface/IStateService';
import { IStateRepository } from '@board/interface/IStateStore';
import { BoardRepository } from '@board/repository/board.repository';
import { LogService } from '@log/log.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardService } from './board.service';

@Injectable()
export class StateService implements IStateService {
	constructor(
		private readonly stateRepo: IStateRepository,
		private readonly boardRepo: BoardRepository,
		private readonly boardService: BoardService,
		private readonly logService: LogService,
	) {}

	/**
	 * Load or initialize the state for a given board.
	 */
	async loadState(boardId: string): Promise<Board> {
		this.logService.log(`StateService: Loading state for board ${boardId}`);
		const state = await this.stateRepo.getFullState(boardId);

		if (state) {
			this.logService.log(
				`StateService: Found existing state for board ${boardId}`,
			);
			return state;
		}

		this.logService.log(
			`StateService: No state found, initializing from database for board ${boardId}`,
		);
		const board = await this.boardRepo.findBoardByIdLatest(boardId);
		if (!board) {
			this.logService.error(
				`StateService: Board with ID ${boardId} not found`,
			);
			throw new NotFoundException(`Board with ID ${boardId} not found`);
		}

		const shapes = await this.boardRepo.findShapesByBoardIdAndVersion(
			boardId,
			board.baseVersion,
		);

		const transformedShapes = shapes.map((shape) =>
			this.boardService.databaseShapeToShape(shape),
		);
		this.logService.log(
			`StateService: Transformed ${transformedShapes.length} shapes for board ${boardId}`,
		);

		const fullBoard = await this.stateRepo.loadState({
			id: board.id,
			width: board.width,
			height: board.height,
			baseVersion: board.baseVersion,
			shapes: transformedShapes,
		});
		this.logService.log(
			`StateService: Successfully loaded state for board ${boardId}`,
		);

		return fullBoard;
	}

	/**
	 * Get the current in-memory state.
	 */
	async getState(stateId: string): Promise<Board> {
		const board = await this.stateRepo.getFullState(stateId);
		if (!board) {
			this.logService.error(
				`StateService: State with ID ${stateId} not found`,
			);
			throw new NotFoundException(`State with ID ${stateId} not found`);
		}
		this.logService.log(
			`StateService: Successfully retrieved state for board ${stateId}`,
		);
		return board;
	}

	/**
	 * Apply deltas and persist snapshot if needed.
	 */
	async applyDeltas(
		stateId: string,
		deltas: DeltaOperation[],
		expectedVersion: number,
	): Promise<BoardStateDto> {
		this.logService.log(
			`StateService: Applying ${deltas.length} deltas to board ${stateId} at version ${expectedVersion}`,
		);

		// apply each delta operation
		let board: Board;
		for (const delta of deltas) {
			board = await this.stateRepo.applyDelta(stateId, {
				type: delta.type,
				shape: delta.shape,
				version: expectedVersion,
			});
		}

		await this.saveStateInDatabase(stateId);

		// Ensure board is defined before converting to DTO
		if (!board) {
			this.logService.log(
				`StateService: Retrieving final state for board ${stateId}`,
			);
			board = await this.stateRepo.getFullState(stateId);
		}

		this.logService.log(
			`StateService: Successfully applied deltas to board ${stateId}`,
		);
		return null; //TODO: Convert to DTO
	}

	/**
	 * Persist current state to database.
	 */
	async saveStateInDatabase(stateId: string): Promise<void> {
		const board = await this.stateRepo.getFullState(stateId);

		await this.boardRepo.createBoard(board);
	}

	/**
	 * Clear in-memory state.
	 */
	async clearState(stateId: string): Promise<void> {
		await this.stateRepo.deleteState(stateId);
		this.logService.log(
			`StateService: Successfully cleared state for board ${stateId}`,
		);
	}
}
