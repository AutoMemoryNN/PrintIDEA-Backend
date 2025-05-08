import { Board, DeltaOperation, Shape } from '@board/board.types';
import { IStateRepository } from '@board/interface/IStateStore';
import { LogService } from '@log/log.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryStateRepository implements IStateRepository {
	constructor(private readonly logService: LogService) {}

	private states = new Map<string, Board>();

	loadState(boardMeta: Board): Promise<Board> {
		this.logService.log(`Loading state for board: ${boardMeta.id}`);
		this.states.set(boardMeta.id, boardMeta);
		return Promise.resolve(boardMeta);
	}

	async deleteState(stateId: string): Promise<void> {
		this.logService.log(`Deleting state for board: ${stateId}`);
		await this.states.delete(stateId);
	}

	async getFullState(stateId: string): Promise<Board> {
		this.logService.log(`Getting full state for board: ${stateId}`);
		const board = await this.states.get(stateId);
		if (!board) {
			this.logService.warn(`Board with id ${stateId} not found`);
			return null;
		}
		const { id, width, height, baseVersion, shapes } = board;
		this.logService.debug(
			`Retrieved board with ${shapes.length} shapes, version ${baseVersion}`,
		);
		return { id, width, height, baseVersion, shapes };
	}

	async applyDelta(stateId: string, delta: DeltaOperation): Promise<Board> {
		this.logService.log(
			`Applying delta to board: ${stateId}, operation: ${delta.type}, version: ${delta.version}`,
		);
		const board = this.states.get(stateId);
		if (!board) {
			this.logService.warn(
				`Cannot apply delta: Board with id ${stateId} not found`,
			);
			return null;
		}

		if (delta.version !== board.baseVersion + 1) {
			const errMsg = `Version mismatch: expected ${board.baseVersion + 1}, got ${delta.version}`;
			this.logService.error(errMsg);
			throw new Error(errMsg);
		}

		switch (delta.type) {
			case 'ADD':
				this.logService.debug(
					`Adding shape ${delta.shape.id} to board ${stateId}`,
				);
				board.shapes.push(delta.shape as Shape);
				break;
			case 'UPDATE': {
				const idx = board.shapes.findIndex(
					(s) => s.id === delta.shape.id,
				);
				if (idx !== -1) {
					this.logService.debug(
						`Updating shape ${delta.shape.id} in board ${stateId}`,
					);
					board.shapes[idx] = delta.shape as Shape;
				} else {
					this.logService.warn(
						`Shape ${delta.shape.id} not found for update operation`,
					);
				}
				break;
			}
			case 'DELETE':
				this.logService.debug(
					`Deleting shape ${delta.shape.id} from board ${stateId}`,
				);
				board.shapes = board.shapes.filter(
					(s) => s.id !== delta.shape.id,
				);
				break;
			default: {
				const errMsg = `Unknown delta type: ${delta.type}`;
				this.logService.error(errMsg);
				throw new Error(errMsg);
			}
		}

		board.baseVersion = delta.version;
		this.logService.log(
			`Board ${stateId} updated to version ${delta.version}, now has ${board.shapes.length} shapes`,
		);

		const { id, width, height, baseVersion, shapes } = board;
		return { id, width, height, baseVersion, shapes };
	}
}
