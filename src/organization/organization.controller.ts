import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
} from '@nestjs/common';
import {
	AddUserDto,
	CreateOrgDto,
	OrgInfo,
	UpdateOrgDto,
} from '@org/organization.dto';
import { OrganizationService } from '@org/organization.service';
import { UserId, UserRole } from '@security/security.decorators';
import { ControllerResponse } from '@type/index';

@Controller('organization')
export class OrganizationController {
	constructor(private orgService: OrganizationService) {}
	@Post()
	createOrganization(
		@UserId() userId: string,
		@Body() createOrganizationDto: CreateOrgDto,
	): ControllerResponse {
		const { name, description } = createOrganizationDto;
		const newOrg = this.orgService.create(name, description, userId);
		return {
			message: `Organization created successfully ${newOrg.id}`,
		};
	}

	@Delete(':id')
	deleteOrganization(
		@Param('id') id: string,
		@UserId() userId: string,
	): ControllerResponse {
		console.log(`User ID: ${userId} - Deleting Organization with ID ${id}`);

		return {
			message: `Organization with ID ${id} deleted successfully`,
		};
	}

	@Put(':id')
	updateOrganization(
		@Param('id') id: string,
		@Body() updateOrganizationDto: UpdateOrgDto,
		@UserId() userId: string,
	): ControllerResponse {
		console.log(`User ID: ${userId} - Updating Organization with ID ${id}`);
		console.log(`${updateOrganizationDto}`);

		return {
			message: `Organization with ID ${id} updated successfully`,
		};
	}

	@Get(':id')
	getOrganization(
		@Param('id') id: string,
		@UserRole() userRole: string,
	): ControllerResponse<OrgInfo> {
		console.log(
			`User Role: ${userRole} - Retrieving Organization with ID ${id}`,
		);

		return {
			message: `Organization with ID ${id} retrieved successfully`,
			data: {
				id,
				name: 'Sample Name',
				description: 'Sample Description',
			},
		};
	}

	@Get()
	getOrganizationsByUserId(
		@Param('id') id: string,
		@UserId() userId: string,
	): ControllerResponse<OrgInfo[]> {
		console.log(
			`User Role: ${userId} - Retrieving Organizations for User with ID ${id}`,
		);
		const orgs = this.orgService.getOrgsByUserId(userId);
		return {
			message: `Organizations for User with ID ${id} retrieved successfully`,
			data: orgs,
		};
	}

	@Post('add-user')
	addUserToOrganization(
		@Body() addUserDto: AddUserDto,
		@UserId() userId: string,
	): ControllerResponse {
		const { mail, role } = addUserDto;
		this.orgService.addUser(mail, role, userId);
		return {
			message: `User ${mail} added to organization successfully`,
		};
	}
}
