import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
} from '@nestjs/common';
import { ProjectService } from '@projects/project.service';
import { UserId } from '@security/security.decorators';
import { ControllerResponse, ProjectDatabase } from '@type/index';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';

@Controller('projects')
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	@Get(':org')
	async getMyProjects(
		@Param('org') organizationId: string,
		@UserId() userId: string,
	): Promise<ControllerResponse<ProjectDatabase[]>> {
		const projects = await this.projectService.getProjectsByOrgId(
			organizationId,
			userId,
		);
		return {
			message: 'Projects retrieved successfully',
			data: projects,
		};
	}

	@Post(':org')
	async createProject(
		@Param('org') organizationId: string,
		@UserId() userId: string,
		@Body() createProjectDto: CreateProjectDto,
	): Promise<ControllerResponse<ProjectDatabase>> {
		const newProject = await this.projectService.createProject(
			organizationId,
			userId,
			createProjectDto,
		);
		return {
			message: `Project created successfully ${newProject.id}`,
			data: newProject,
		};
	}

	@Delete(':org/:id')
	async deleteProject(
		@Param('org') organizationId: string,
		@Param('id') id: string,
		@UserId() userId: string,
	): Promise<ControllerResponse> {
		await this.projectService.deleteProject(id, organizationId, userId);
		return {
			message: `Project with ID ${id} deleted successfully`,
		};
	}

	@Put(':org/:id')
	async updateProject(
		@Param('org') organizationId: string,
		@Param('id') id: string,
		@UserId() userId: string,
		@Body() updatedProjectDto: UpdateProjectDto,
	): Promise<ControllerResponse<ProjectDatabase>> {
		const updatedProject = await this.projectService.updateProject(
			id,
			organizationId,
			userId,
			updatedProjectDto,
		);
		return {
			message: `Project with ID ${id} updated successfully`,
			data: updatedProject,
		};
	}
}
