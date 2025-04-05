import { BoardService } from '@board/board.service';
import { LogService } from '@log/log.service';
import {
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { OrganizationService } from '@org/organization.service';
import { CreateProjectDto } from '@projects/project.dto';
import { ProjectRepository } from '@projects/project.repository';
import { IdService } from '@security/uuid.security';
import { OrgRoles, ProjectDatabase } from '@type/index';

@Injectable()
export class ProjectService {
	private readonly logger = new LogService(ProjectService.name); // use LogService for logging

	constructor(
		private readonly projectRepository: ProjectRepository,
		private readonly organizationService: OrganizationService,
		private readonly idService: IdService,
		private readonly boardService: BoardService,
	) {}

	async getProjectsByOrgId(
		organizationId: string,
		userId: string,
	): Promise<ProjectDatabase[]> {
		this.logger.log(
			`Fetching projects for organization: ${organizationId} by user: ${userId}`,
		);

		try {
			const userOrg =
				await this.organizationService.getUserRoleInOrganization(
					organizationId,
					userId,
				);

			if (!userOrg) {
				this.logger.warn(
					`Access denied: User ${userId} attempted to access organization ${organizationId} without permission`,
				);
				throw new ForbiddenException(
					'User does not have access to this organization',
				);
			}

			this.logger.log(
				`User ${userId} has role ${userOrg} in organization ${organizationId}`,
			);
			const projects =
				await this.projectRepository.getProjectsByOrganizationId(
					organizationId,
				);

			this.logger.log(
				`Successfully retrieved ${projects.length} projects for organization ${organizationId}`,
			);
			return projects;
		} catch (error) {
			if (error instanceof ForbiddenException) {
				throw error;
			}

			this.logger.error(
				`Failed to fetch projects for organization ${organizationId}: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error retrieving projects: ${error.message}`,
			);
		}
	}

	async createProject(
		organizationId: string,
		userId: string,
		projectData: CreateProjectDto,
	): Promise<ProjectDatabase> {
		this.logger.log(
			`Creating new project in organization ${organizationId} by user ${userId}`,
		);

		try {
			const id = await this.idService.generatePrefixedId('proj_');
			this.logger.log(`Generated project ID: ${id}`);

			const projectToCreate = {
				...projectData,
				organizationId,
				id,
				boardId: await this.boardService.createBoard(),
			} as ProjectDatabase;

			const userOrg =
				await this.organizationService.getUserRoleInOrganization(
					organizationId,
					userId,
				);

			if (!userOrg) {
				this.logger.warn(
					`Access denied: User ${userId} attempted to create project in organization ${organizationId} without membership`,
				);
				throw new ForbiddenException(
					'User does not have access to this organization',
				);
			}

			if (![OrgRoles.ADMIN, OrgRoles.LEADER].includes(userOrg)) {
				this.logger.warn(
					`Permission denied: User ${userId} with role ${userOrg} attempted to create project in organization ${organizationId}`,
				);
				throw new ForbiddenException(
					'User does not have permission to create projects',
				);
			}

			this.logger.log(
				`User ${userId} authorized to create project with role ${userOrg}`,
			);
			const createdProject =
				await this.projectRepository.createProject(projectToCreate);
			this.logger.log(
				`Successfully created project ${createdProject.id}: ${createdProject.name}`,
			);

			return createdProject;
		} catch (error) {
			if (error instanceof ForbiddenException) {
				throw error;
			}

			this.logger.error(
				`Failed to create project in organization ${organizationId}: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error creating project: ${error.message}`,
			);
		}
	}

	async deleteProject(
		id: string,
		organizationId: string,
		userId: string,
	): Promise<void> {
		this.logger.log(
			`Attempting to delete project ${id} from organization ${organizationId} by user ${userId}`,
		);

		try {
			const userOrg =
				await this.organizationService.getUserRoleInOrganization(
					organizationId,
					userId,
				);

			if (!userOrg) {
				this.logger.warn(
					`Access denied: User ${userId} attempted to delete project ${id} without organization membership`,
				);
				throw new ForbiddenException(
					'User does not have access to this organization',
				);
			}

			if (![OrgRoles.ADMIN, OrgRoles.LEADER].includes(userOrg)) {
				this.logger.warn(
					`Permission denied: User ${userId} with role ${userOrg} attempted to delete project ${id}`,
				);
				throw new ForbiddenException(
					'User does not have permission to delete projects',
				);
			}

			this.logger.log(
				`User ${userId} authorized to delete project with role ${userOrg}`,
			);
			const result = await this.projectRepository.deleteProject(
				id,
				organizationId,
			);

			if (!result) {
				this.logger.warn(
					`Project ${id} not found or already deleted in organization ${organizationId}`,
				);
				throw new NotFoundException(`Project with ID ${id} not found`);
			}

			this.logger.log(
				`Successfully deleted project ${id} from organization ${organizationId}`,
			);
		} catch (error) {
			if (
				error instanceof ForbiddenException ||
				error instanceof NotFoundException
			) {
				throw error;
			}

			this.logger.error(
				`Failed to delete project ${id} from organization ${organizationId}: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error deleting project: ${error.message}`,
			);
		}
	}

	async updateProject(
		id: string,
		organizationId: string,
		userId: string,
		projectData: Partial<ProjectDatabase>,
	): Promise<ProjectDatabase> {
		this.logger.log(
			`Updating project ${id} in organization ${organizationId} by user ${userId}`,
		);

		try {
			const userOrg =
				await this.organizationService.getUserRoleInOrganization(
					organizationId,
					userId,
				);

			if (!userOrg) {
				this.logger.warn(
					`Access denied: User ${userId} attempted to update project ${id} without organization membership`,
				);
				throw new ForbiddenException(
					'User does not have access to this organization',
				);
			}

			const project = await this.projectRepository.getProjectById(id);
			if (!project) {
				this.logger.warn(
					`Project ${id} not found when attempting update by user ${userId}`,
				);
				throw new NotFoundException(`Project with ID ${id} not found`);
			}

			if (![OrgRoles.ADMIN, OrgRoles.LEADER].includes(userOrg)) {
				this.logger.warn(
					`Permission denied: User ${userId} with role ${userOrg} attempted to update project ${id}`,
				);
				throw new ForbiddenException(
					'User does not have permission to update this project',
				);
			}

			this.logger.log(
				`User ${userId} authorized to update project with role ${userOrg}`,
			);
			this.logger.log(
				`Updating project ${id} with data: ${JSON.stringify(projectData)}`,
			);

			const result = await this.projectRepository.updateProject(
				id,
				organizationId,
				projectData,
			);

			if (!result) {
				this.logger.warn(
					`Project ${id} not found or not updated in organization ${organizationId}`,
				);
				throw new NotFoundException(
					`Project with ID ${id} not found or not updated`,
				);
			}

			this.logger.log(
				`Successfully updated project ${id}: ${result.name}`,
			);
			return result;
		} catch (error) {
			if (
				error instanceof ForbiddenException ||
				error instanceof NotFoundException
			) {
				throw error;
			}

			this.logger.error(
				`Failed to update project ${id} in organization ${organizationId}: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error updating project: ${error.message}`,
			);
		}
	}
}
