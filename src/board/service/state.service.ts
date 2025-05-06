import { InMemoryBoardSession } from '@board/repository/boardSession.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardSessionService {
	constructor(private readonly stateRepo: InMemoryBoardSession) {}
}
