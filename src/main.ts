import { config } from 'dotenv';
config({ override: false });

import { AppModule } from '@app/app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, { cors: true });
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
