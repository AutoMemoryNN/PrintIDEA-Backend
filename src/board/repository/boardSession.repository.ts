import {
	BoardSession,
	ISessionStore,
	Participant,
} from '@board/interface/IBoardSessionStore';
import { LogService } from '@log/log.service';
import { Injectable } from '@nestjs/common';
import { IdService } from '@security/uuid.security';

@Injectable()
export class InMemoryBoardSession implements ISessionStore {
	constructor(
		private readonly idService: IdService,
		private readonly logService: LogService,
	) {}

	async getSessionByBoardId(boardId: string): Promise<BoardSession> {
		const session = await this.sessions.get(boardId);
		if (!session) {
			this.logService.error(`No session for board ${boardId}`);
			return;
		}
		this.logService.log(`Session ${boardId} retrieved`);
		return session;
	}

	private sessions = new Map<string, BoardSession>();

	async getSession(sessionId: string): Promise<BoardSession> {
		const session = await this.sessions.get(sessionId);
		if (!session) {
			this.logService.error(`No session for board ${sessionId}`);
			return;
		}
		this.logService.log(`Session ${sessionId} retrieved`);
		return session;
	}

	async createSession(
		boardId: string,
		stateId: string,
	): Promise<BoardSession> {
		const existingSession = await this.getSession(boardId);
		if (existingSession) {
			return existingSession;
		}

		const sessionId = `BSession_${await this.idService.generateShortId()}`;
		const newSession: BoardSession = {
			sessionId,
			boardId,
			stateId,
			participants: [],
		};
		this.sessions.set(sessionId, newSession);
		this.logService.log(
			`Session ${sessionId} created for board ${boardId}`,
		);
		return newSession;
	}

	async removeSession(sessionId: string): Promise<void> {
		const deleted = await this.sessions.delete(sessionId);
		if (!deleted) {
			this.logService.error(`Session ${sessionId} not found`);
		}
		this.logService.log(`Session ${sessionId} removed`);
	}

	async addParticipant(
		sessionId: string,
		participant: Participant,
	): Promise<BoardSession> {
		const session = this.sessions.get(sessionId);
		if (!session) {
			this.logService.error(`Session ${sessionId} not found`);
			return;
		}

		if (!session.participants.find((p) => p.id === participant.id)) {
			session.participants.push({ ...participant, joinedAt: new Date() });
		}

		this.logService.log(
			`Participant ${participant.name} added to session ${sessionId}`,
		);
		return session;
	}

	async removeParticipant(
		sessionId: string,
		participantId: string,
	): Promise<BoardSession> {
		const session = this.sessions.get(sessionId);
		if (!session) {
			this.logService.error(`Session ${sessionId} not found`);
			return;
		}

		session.participants = session.participants.filter(
			(p) => p.id !== participantId,
		);

		this.logService.log(
			`Participant ${participantId} removed from session ${sessionId}`,
		);
		return session;
	}
}
