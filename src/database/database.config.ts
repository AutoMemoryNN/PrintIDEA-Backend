import type { DrizzlePostgresConfig } from '@knaadh/nestjs-drizzle-postgres';

import { Schema } from '@database/database.schema';

export class DatabaseConfig {
	readonly dbHost: string =
		process.env.NODE_ENV === 'prod'
			? process.env.DB_HOST
			: process.env.DB_DEV_HOST;

	create(): DrizzlePostgresConfig {
		return {
			postgres: {
				url: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${this.dbHost}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
				config: {
					ssl: false,
				},
			},
			config: { schema: { ...Schema } },
		};
	}
}
