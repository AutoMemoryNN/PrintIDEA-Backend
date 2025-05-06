import { OrgRoles } from '@database/database.schema';

// biome-ignore lint/style/useNamingConvention: "Naming convention is not important in this case"
export interface ISessionStore {
	getSession(sessionId: string): Promise<BoardSession>;

	createSession(boardId: string, stateId: string): Promise<BoardSession>;

	removeSession(sessionId: string): Promise<void>;

	addParticipant(
		sessionId: string,
		participant: Participant,
	): Promise<BoardSession>;

	removeParticipant(
		sessionId: string,
		participantId: string,
	): Promise<BoardSession>;
}

export interface BoardSession {
	sessionId: string;
	boardId: string;
	participants: Participant[];
	stateId: string;
}

export interface Participant {
	id: string;
	name: string;
	role: OrgRoles;
	joinedAt: Date;
}
