import { Schema } from '@database/database.schema';
import { Inject, Injectable } from '@nestjs/common';
import { UserDatabase } from '@type/index';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class UserRepository {
	constructor(
		@Inject('APP-DB')
		private readonly db: PostgresJsDatabase<typeof Schema>,
	) {}

	async insertUser(user: UserDatabase): Promise<UserDatabase> {
		const users = Schema.users;
		const result = await this.db.insert(users).values(user).returning();
		return result[0];
	}

	async getUserByEmail(email: string): Promise<UserDatabase> {
		const users = Schema.users;
		const result = await this.db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				alias: users.alias,
				role: users.role,
			})
			.from(users)
			.where(eq(users.email, email));

		return result[0];
	}

	async deleteUserByEmail(email: string): Promise<void> {
		const users = Schema.users;
		await this.db.delete(users).where(eq(users.email, email));
	}
}
