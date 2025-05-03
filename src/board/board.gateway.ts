import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway(80, { namespace: 'board', cors: '*' })
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
	handleDisconnect(_client: Socket): void {
		throw new Error('Method not implemented.');
	}
	handleConnection(_client: Socket, ..._args: unknown[]): void {
		throw new Error('Method not implemented.');
	}
	@WebSocketServer()
	server: Server;
}
