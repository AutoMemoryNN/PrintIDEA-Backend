import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AddUserDto, CreateOrgDto, OrgInfo } from '@org/organization.dto';
import { OrganizationService } from '@org/organization.service';
import { UserId } from '@security/security.decorators';
import { ControllerResponse, OrganizationDatabase } from '@type/index';

@Controller('organizations')
export class OrganizationController {
	constructor(private readonly orgService: OrganizationService) {}
	@Post()
	async createOrganization(
		@UserId() userId: string,
		@Body() createOrganizationDto: CreateOrgDto,
	): Promise<ControllerResponse<OrganizationDatabase>> {
		const { name, description } = createOrganizationDto;
		const newOrg = await this.orgService.create(name, description, userId);
		return {
			message: `Organization created successfully ${newOrg.id}`,
			data: newOrg,
		};
	}

	@Delete(':id')
	deleteOrganization(
		@Param('id') id: string,
		@UserId() userId: string,
	): ControllerResponse {
		this.orgService.deleteOrganization(id, userId);
		return {
			message: `Organization with ID ${id} deleted successfully`,
		};
	}

	// @Put(':id')
	// async updateOrganization(
	// 	@Param('id') id: string,
	// 	@Body() updateOrganizationDto: UpdateOrgDto,
	// 	@UserId() userId: string,
	// ): Promise<ControllerResponse<OrganizationDatabase>> {

	// }

	@Get(':id')
	async getOrganization(
		@Param('id') id: string,
		@UserId() userId: string,
	): Promise<ControllerResponse<OrgInfo>> {
		const orgInfo = await this.orgService.getOrganizationById(id, userId);
		return {
			message: 'Organization retrieved successfully',
			data: orgInfo,
		};
	}

	@Get()
	async getOrganizationsByUserId(
		@UserId() userId: string,
	): Promise<ControllerResponse<OrganizationDatabase[]>> {
		const orgs = await this.orgService.getOrganizationsByUserId(userId);
		return {
			message: 'Organizations retrieved successfully',
			data: orgs,
		};
	}

	@Post(':id/add-user')
	async addUserToOrganization(
		@Param('id') orgId: string,
		@Body() addUserDto: AddUserDto,
		@UserId() userId: string,
	): Promise<ControllerResponse> {
		const { mail, role } = addUserDto;
		await this.orgService.addUser(orgId, mail, role, userId);
		return {
			message: `User ${mail} added to organization successfully`,
		};
	}

	@Delete(':id/remove-user/:removeUserId')
	async removeUserFromOrganization(
		@Param('id') orgId: string,
		@Param('removeUserId') removeUserId: string,
		@UserId() userId: string,
	): Promise<ControllerResponse> {
		await this.orgService.removeUserFrom(orgId, userId, removeUserId);
		return {
			message: 'User removed from organization successfully',
		};
	}
}
