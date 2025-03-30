import { InjectDrizzle } from '@knaadh/nestjs-drizzle-postgres';
import { Controller, Get } from '@nestjs/common';

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
}
