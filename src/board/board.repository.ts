import { Schema } from '@database/database.schema';
import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class BoardRepository {
	constructor(
		@Inject('APP-DB')
		private readonly db: PostgresJsDatabase<typeof Schema>,
	) {}
}
