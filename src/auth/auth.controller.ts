import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
	@Get()
	findAll(): string {
		return 'Hello World!';
	}
}
