import { InjectDrizzle } from '@knaadh/nestjs-drizzle-postgres';
import { Controller, Get, Post } from '@nestjs/common';
import { sql } from 'drizzle-orm';

@Controller('db-test')
export class DbTestController {
	constructor(@InjectDrizzle('APP-DB') private readonly db) {}

	@Get()
	async testConnection(): Promise<{
		success: boolean;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		data?: any;
		error?: string;
	}> {
		try {
			const result = await this.db.execute('SELECT 1 AS result');
			return { success: true, data: result };
		} catch (error) {
			return { success: false, error: error.message };
		}
	}
	// select all from userOrganization
	@Get('members')
	async getUserOrganization(): Promise<{
		success: boolean;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		data?: any;
		error?: string;
	}> {
		try {
			const result = await this.db.execute(
				'SELECT * FROM users_organizations',
			);
			return { success: true, data: result };
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	@Post()
	async createTestUser(): Promise<{
		success: boolean;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		data?: any;
		error?: string;
	}> {
		try {
			const adminResult = await this.db.execute(
				sql`INSERT INTO users (id, name, alias, email, role)
					 VALUES ('1', 'Admin User', 'admin', 'admin@example.com', 'admin') RETURNING *`,
				['1', 'Admin User', 'admin', 'admin@example.com', 'admin'],
			);

			const clientResult = await this.db.execute(
				sql`INSERT INTO users (id, name, alias, email, role) VALUES ('2', 'Client User', 'client', 'client@example.com', 'client') RETURNING *`,
				['2', 'Client User', 'client', 'client@example.com', 'client'],
			);

			return {
				success: true,
				data: {
					admin: adminResult[0],
					client: clientResult[0],
				},
			};
		} catch (error) {
			return { success: false, error: error.message };
		}
	}
}
