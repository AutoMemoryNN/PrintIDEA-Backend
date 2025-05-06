// src/board/interface/IStateRepository.ts
import { Board, DeltaOperation, Shape } from '@board/board.types';

// biome-ignore lint/style/useNamingConvention: "Naming convention is not important in this case"
export interface IStateRepository {
	getFullState(stateId: string): Promise<Board>;

	applyDelta(stateId: string, delta: DeltaOperation): Promise<Board>;

	loadState(boardMeta: Board, shapes: Shape[]): Promise<Board>;

	deleteState(stateId: string): Promise<void>;
}
