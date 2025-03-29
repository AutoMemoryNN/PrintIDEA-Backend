import { Controller, Get, Param } from '@nestjs/common';

@Controller('user')
export class UserController {
	//get a user by id
	@Get(':id')
	findOne(@Param('id') id: string): string {
		return `User with id: ${id}`;
	}
}
