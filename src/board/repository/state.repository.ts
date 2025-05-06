import { Board, DeltaOperation, Shape } from '@board/board.types';
import { IStateRepository } from '@board/interface/IStateStore';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class InMemoryStateRepository implements IStateRepository {
	private states = new Map<string, Board>();

	loadState(boardMeta: Board, shapes: Shape[]): Promise<Board> {
		const board: Board = {
			id: boardMeta.id,
			width: boardMeta.width,
			height: boardMeta.height,
			baseVersion: boardMeta.baseVersion,
			shapes: shapes,
		};
		this.states.set(board.id, board);
		return Promise.resolve(boardMeta);
	}

	async deleteState(stateId: string): Promise<void> {
		await this.states.delete(stateId);
	}

	async getFullState(stateId: string): Promise<Board> {
		const board = await this.states.get(stateId);
		if (!board) {
			throw new NotFoundException(`State ${stateId} not found`);
		}
		const { id, width, height, baseVersion, shapes } = board;
		return { id, width, height, baseVersion, shapes };
	}

	async applyDelta(stateId: string, delta: DeltaOperation): Promise<Board> {
		const board = this.states.get(stateId);
		if (!board) {
			throw new NotFoundException(`State ${stateId} not found`);
		}

		if (delta.version !== board.baseVersion + 1) {
			throw new Error(
				`Version mismatch: expected ${board.baseVersion + 1}, got ${delta.version}`,
			);
		}

		switch (delta.type) {
			case 'ADD':
				board.shapes.push(delta.shape as Shape);
				break;
			case 'UPDATE': {
				const idx = board.shapes.findIndex(
					(s) => s.id === delta.shape.id,
				);
				if (idx !== -1) {
					board.shapes[idx] = delta.shape as Shape;
				}
				break;
			}
			case 'DELETE':
				board.shapes = board.shapes.filter(
					(s) => s.id !== delta.shape.id,
				);
				break;
			default:
				throw new Error(`Unknown delta type: ${delta.type}`);
		}

		board.baseVersion = delta.version;

		const { id, width, height, baseVersion, shapes } = board;
		return { id, width, height, baseVersion, shapes };
	}
}
