import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway(80, { namespace: 'board', cors: '*' })
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	handleDisconnect(client: Socket): void {
		throw new Error('Method not implemented.');
	}
	handleConnection(client: Socket, ...args: any[]): void {
		throw new Error('Method not implemented.');
	}
}
