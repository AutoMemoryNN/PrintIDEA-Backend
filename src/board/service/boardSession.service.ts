import { STATE_SERVICE } from '@board/board.tokens';
import { Board, DeltaOperation } from '@board/board.types';
import { ISessionService } from '@board/interface/IBoardSessionService';
import { BoardSession, Participant } from '@board/interface/IBoardSessionStore';
import { IStateService } from '@board/interface/IStateService';
import { InMemoryBoardSession } from '@board/repository/boardSession.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationService } from '@org/organization.service';

@Injectable()
export class BoardSessionService implements ISessionService {
	constructor(
		private readonly boardSessionRepo: InMemoryBoardSession,
		@Inject(STATE_SERVICE) private readonly stateService: IStateService,
		private readonly _organizationService: OrganizationService,
	) {}

	/**
	 * Join or create a session for a given board.
	 * Returns the current board session.
	 */
	async joinSession(boardId: string): Promise<BoardSession> {
		const existingSession =
			await this.boardSessionRepo.getSessionByBoardId(boardId);
		if (existingSession) {
			return existingSession;
		}
		const state = await this.stateService.loadState(boardId);
		const session = await this.boardSessionRepo.createSession(
			boardId,
			state.id,
		);
		return session;
	}

	/**
	 * Remove a participant and close session if empty
	 */
	async leaveSession(
		sessionId: string,
		participantId: string,
	): Promise<void> {
		if (
			!(await this.boardSessionRepo.removeParticipant(
				sessionId,
				participantId,
			))
		) {
			throw new NotFoundException(
				`Participant ${participantId} not found in session ${sessionId}`,
			);
		}
		const session = await this.boardSessionRepo.getSession(sessionId);
		if (session.participants.length === 0) {
			await this.closeSession(sessionId);
		}
	}

	/**
	 * Get the session's current stateId
	 */
	async getSessionStateId(sessionId: string): Promise<string> {
		const session = await this.boardSessionRepo.getSession(sessionId);
		if (!session) {
			throw new NotFoundException(`Session ${sessionId} not found`);
		}
		return session.stateId;
	}

	/**
	 * Add a participant to the session
	 */
	async addParticipant(
		sessionId: string,
		participant: Participant,
	): Promise<void> {
		await this.boardSessionRepo.addParticipant(sessionId, participant);
	}

	/**
	 * Remove a participant from the session
	 */
	async removeParticipant(
		sessionId: string,
		participantId: string,
	): Promise<void> {
		await this.boardSessionRepo.removeParticipant(sessionId, participantId);
	}

	/**
	 * Close session and clear its state
	 */
	async closeSession(sessionId: string): Promise<void> {
		await this.boardSessionRepo.removeSession(sessionId);
		await this.stateService.clearState(sessionId);
	}

	async getBoardState(sessionId: string): Promise<Board> {
		const session = await this.boardSessionRepo.getSession(sessionId);
		if (!session) {
			throw new NotFoundException(`Session ${sessionId} not found`);
		}
		return await this.stateService.getState(session.boardId);
	}

	async applyDeltas(
		sessionId: string,
		delta: DeltaOperation[],
		expectedVersion: number,
	): Promise<Board> {
		const session = await this.boardSessionRepo.getSession(sessionId);
		if (!session) {
			throw new NotFoundException(`Session ${sessionId} not found`);
		}
		return await this.stateService.applyDeltas(
			session.boardId,
			delta,
			expectedVersion,
		);
	}
}
