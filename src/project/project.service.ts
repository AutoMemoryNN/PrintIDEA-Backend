import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { OrganizationService } from '@org/organization.service';
import { CreateProjectDto } from '@projects/project.dto';
import { ProjectRepository } from '@projects/project.repository';
import { IdService } from '@security/uuid.security';
import { OrgRoles, ProjectDatabase } from '@type/index';

@Injectable()
export class ProjectService {
	constructor(
		private readonly projectRepository: ProjectRepository,
		private readonly organizationService: OrganizationService,
		private readonly idService: IdService,
	) {}

	async getProjectsByOrgId(
		organizationId: string,
		userId: string,
	): Promise<ProjectDatabase[]> {
		const userOrg =
			await this.organizationService.getUserRoleInOrganization(
				organizationId,
				userId,
			);
		if (!userOrg) {
			throw new ForbiddenException(
				'User does not have access to this organization',
			);
		}

		return await this.projectRepository.getProjectsByOrganizationId(
			organizationId,
		);
	}

	async createProject(
		organizationId: string,
		userId: string,
		projectData: CreateProjectDto,
	): Promise<ProjectDatabase> {
		const id = await this.idService.generatePrefixedId('proj_');
		const projectToCreate = {
			...projectData,
			organizationId,
			id,
		} as ProjectDatabase;

		const userOrg =
			await this.organizationService.getUserRoleInOrganization(
				organizationId,
				userId,
			);
		if (!userOrg) {
			throw new ForbiddenException(
				'User does not have access to this organization',
			);
		}

		if (![OrgRoles.ADMIN, OrgRoles.LEADER].includes(userOrg)) {
			throw new ForbiddenException(
				'User does not have permission to create projects',
			);
		}

		return await this.projectRepository.createProject(projectToCreate);
	}

	async deleteProject(
		id: string,
		organizationId: string,
		userId: string,
	): Promise<void> {
		const userOrg =
			await this.organizationService.getUserRoleInOrganization(
				organizationId,
				userId,
			);
		if (!userOrg) {
			throw new ForbiddenException(
				'User does not have access to this organization',
			);
		}

		if (![OrgRoles.ADMIN, OrgRoles.LEADER].includes(userOrg)) {
			throw new ForbiddenException(
				'User does not have permission to delete projects',
			);
		}

		const result = await this.projectRepository.deleteProject(
			id,
			organizationId,
		);
		if (!result) {
			throw new NotFoundException(`Project with ID ${id} not found`);
		}
	}

	async updateProject(
		id: string,
		organizationId: string,
		userId: string,
		projectData: Partial<ProjectDatabase>,
	): Promise<ProjectDatabase> {
		const userOrg =
			await this.organizationService.getUserRoleInOrganization(
				organizationId,
				userId,
			);
		if (!userOrg) {
			throw new ForbiddenException(
				'User does not have access to this organization',
			);
		}

		const project = await this.projectRepository.getProjectById(id);
		if (!project) {
			throw new NotFoundException(`Project with ID ${id} not found`);
		}

		if (![OrgRoles.ADMIN, OrgRoles.LEADER].includes(userOrg)) {
			throw new ForbiddenException(
				'User does not have permission to update this project',
			);
		}

		const result = await this.projectRepository.updateProject(
			id,
			organizationId,
			projectData,
		);
		if (!result) {
			throw new NotFoundException(
				`Project with ID ${id} not found or not updated`,
			);
		}

		return result;
	}
}
