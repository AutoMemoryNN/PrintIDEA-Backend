import { BoardStateDto } from '@board/dto/board.dto';
import { Participant } from '@board/interface/IBoardSessionStore';

// biome-ignore lint/style/useNamingConvention: "Naming convention is not important in this case"
export interface ISessionService {
	/**
	 * Join or create a session for a given board.
	 * - If a session exists, returns its current state.
	 * - Otherwise creates new session initialized with boardState.
	 */
	joinSession(boardId: string): Promise<BoardStateDto>;

	/** Leave a session; if last participant, optionally close it. */
	leaveSession(sessionId: string, participantId: string): Promise<void>;

	/** Get current state id of a session’s board. */
	getSessionStateId(sessionId: string): Promise<string>;

	/** Add a participant to the session (e.g. on WebSocket connect). */
	addParticipant(sessionId: string, participant: Participant): Promise<void>;

	/** Remove a participant from the session. */
	removeParticipant(sessionId: string, participantId: string): Promise<void>;

	/** Close a session and release any in‑memory resources. */
	closeSession(sessionId: string): Promise<void>;
}
