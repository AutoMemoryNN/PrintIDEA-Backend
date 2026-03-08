import { config } from 'dotenv';
config({ override: false });

import { AppModule } from '@app/app.module';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, { cors: true });
	const configApi = new DocumentBuilder()
		.setTitle('PrintIdea API')
		.setDescription('PrintIdea API description')
		.setVersion('1.0')
		.addTag('printidea')
		.build();
	const documentApi = SwaggerModule.createDocument(app, configApi);

	SwaggerModule.setup('api', app, documentApi, {
		explorer: true,
		customSiteTitle: 'PrintIdea API Docs',
	});

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
