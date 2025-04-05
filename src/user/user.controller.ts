import { UserRoles } from '@database/database.schema';
import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserId, UserRole } from '@security/security.decorators';
import { ControllerResponse } from '@type/index';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	//get a user by id
	@Get(':id')
	findOne(@Param('id') id: string): string {
		return `User with id: ${id}`;
	}

	@ApiOperation({
		summary: 'Delete a user by email',
	})
	@Delete('email/:email')
	async deleteByEmail(
		@Param('email') email: string,
		@UserRole() role: string,
		@UserId() userId: string,
	): Promise<ControllerResponse> {
		// TODO: this conversion should be done in a DTO
		const userRole = role as UserRoles;
		try {
			await this.userService.deleteUserByEmail(email, userRole, userId);
		} catch (error) {
			throw new Error(`Error deleting user: ${error.message}`);
		}
		return {
			message: `User with email ${email} deleted successfully`,
		};
	}
}
