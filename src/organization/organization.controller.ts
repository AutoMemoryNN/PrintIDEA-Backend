import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
} from '@nestjs/common';
import { CreateOrgDto, OrgInfo, UpdateOrgDto } from '@org/organization.dto';
import { OrganizationService } from '@org/organization.service';
import { UserId } from '@security/security.decorators';
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
	deleteOrganization(@Param('id') id: string): ControllerResponse {
		return {
			message: `Organization with ID ${id} deleted successfully`,
		};
	}

	@Put(':id')
	updateOrganization(
		@Param('id') id: string,
		@Body() updateOrganizationDto: UpdateOrgDto,
	): ControllerResponse {
		return {
			message: `Organization with ID ${id} updated successfully`,
		};
	}

	@Get(':id')
	getOrganization(@Param('id') id: string): ControllerResponse<OrgInfo> {
		return {
			message: `Organization with ID ${id} retrieved successfully`,
			data: {
				id,
				name: 'Sample Name',
				description: 'Sample Description',
			},
		};
	}
}
