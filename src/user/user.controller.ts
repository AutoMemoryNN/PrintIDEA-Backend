import { UserRoles } from '@database/database.schema';
import { Controller, Delete, Get, Param } from '@nestjs/common';
import { UserId, UserRole } from '@security/security.decorators';
import { ControllerResponse } from '@type/index';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	//get a user by id
	@Get(':id')
	findOne(@Param('id') id: string): string {
		return `User with id: ${id}`;
	}

	@Delete('email/:email')
	deleteByEmail(
		@Param('email') email: string,
		@UserRole() role: string,
		@UserId() userId: string,
	): ControllerResponse {
		// TODO: this conversion should be done in a DTO
		const userRole = role as UserRoles;
		try {
			this.userService.deleteUserByEmail(email, userRole, userId);
		} catch (error) {
			throw new Error(`Error deleting user: ${error.message}`);
		}
		return {
			message: `User with email ${email} deleted successfully`,
		};
	}
}
