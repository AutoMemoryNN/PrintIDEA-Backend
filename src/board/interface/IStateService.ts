import { Board, DeltaOperation } from '@board/board.types';

/**
 * IStateService encapsulates all board state operations: reading full state,
 * applying deltas, snapshotting, version management and persistence triggers.
 */

// biome-ignore lint/style/useNamingConvention: "Naming convention is not important in this case"
export interface IStateService {
	/**
	 * Load or initialize the state for a given board.
	 * If no in-memory state exists, loads from persistent store or uses empty template.
	 */
	loadState(boardId: string): Promise<Board>;

	/**
	 * Get the current in-memory state (without side effects).
	 */
	getState(stateId: string): Promise<Board>;

	/**
	 * Apply one or more shape-level deltas to the board state.
	 * Handles optimistic version check, merges deltas, increments version.
	 * Returns the updated state.
	 */
	applyDeltas(
		stateId: string,
		deltas: DeltaOperation[],
		expectedVersion: number,
	): Promise<Board>;

	/**
	 * Save the current state to persistent storage.
	 * This is a no-op if the state is already persisted.
	 */
	saveStateInDatabase(stateId: string): Promise<void>;

	clearState(stateId: string): Promise<void>;
}
