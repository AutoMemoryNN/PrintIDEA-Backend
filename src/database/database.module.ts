import { DatabaseConfig } from '@database/database.config';
import { DbTestController } from '@database/database.controller';
import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import { Module } from '@nestjs/common';

@Module({
	imports: [
		DrizzlePostgresModule.registerAsync({
			tag: 'APP-DB',
			useClass: DatabaseConfig,
		}),
	],
	exports: [DrizzlePostgresModule],
	controllers: [DbTestController],
})
export class DatabaseModule {}
