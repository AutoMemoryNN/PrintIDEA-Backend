import { OrgRoles } from '@database/database.schema';
import { BadRequestException } from '@nestjs/common';
import {
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { SessionManagerService } from '@session/session.service';
import { Server, Socket } from 'socket.io';
import { BoardSessionService } from './service/boardSession.service';

@WebSocketGateway(80, { namespace: 'board', cors: '*' })
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;

	constructor(
		private readonly authService: SessionManagerService,
		private readonly session: BoardSessionService,
	) {}

	async handleConnection(client: Socket): Promise<void> {
		const { token, bid } = client.handshake.headers as {
			token: string;
			bid: string;
		};

		try {
			if (!token || !bid) {
				client.emit('error', 'Missing token or bid');
				client.disconnect(true);
				throw new BadRequestException('Missing token or bid');
			}
			const user = this.authService.verifySession(token);
			if (!user) {
				client.emit('error', 'Invalid token');
				client.disconnect(true);
				throw new BadRequestException('Invalid token');
			}

			client.data.user = user;
			let sessionId: string;

			try {
				sessionId = (await this.session.joinSession(bid)).sessionId;
				this.session.addParticipant(sessionId, {
					id: user.id,
					name: user.name,
					role: OrgRoles.MEMBER, // TODO: implement role management
					joinedAt: new Date(),
				});
				client.join(sessionId);
				client.data.user.sessionId = sessionId;
				console.log(
					`User ${user.email} connected to board ${bid} with token ${token}`,
				);
			} catch (error) {
				client.emit('error', error);
				client.disconnect(true);
				throw new BadRequestException(error.message);
			}
		} catch (error) {
			client.emit('error', error);
		}
	}

	handleDisconnect(client: Socket): void {
		this.session.leaveSession(
			client.data.user.sessionId,
			client.data.user.id,
		);
		client.leave(client.data.user.sessionId);
		console.log(
			`User ${client.data.user.email} disconnected from session ${client.data.user.sessionId}`,
		);

		client.disconnect(true);
	}

	@SubscribeMessage('get_board_state')
	async handleGetBoardState(
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		const sessionId = client.data.user.sessionId;

		try {
			const stateId = await this.session.getSessionStateId(sessionId);
			if (!stateId) {
				client.emit('error', 'Session not found');
				return;
			}
			const boardState = await this.session.getBoardState(stateId);
			client.emit('board_state', boardState);
		} catch (_error) {
			client.emit('error', 'Could not retrieve board state');
		}
	}

	// @SubscribeMessage("test_delta")
	// async handleTestDelta(
	// 	@ConnectedSocket() client: Socket,
	// 	data: any,
	// ): Promise<void> {
	// 	const sessionId = client.data.user.sessionId;
	// 	if (!sessionId) {
	// 		client.emit('error', 'Session not found');
	// 		return;
	// 	}
	// 	this.server.to(sessionId).emit('test_delta', data);
}
