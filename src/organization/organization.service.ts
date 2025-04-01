import { OrgRoles } from '@database/database.schema';
import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { OrganizationRepository } from '@org/organization.repository';
import { IdService } from '@security/uuid.security';
import { OrganizationDatabase } from '@type/index';
import { UserRepository } from '@user/user.repository';

@Injectable()
export class OrganizationService {
	constructor(
		private readonly organizationRepository: OrganizationRepository,
		private readonly userRepository: UserRepository,
		private readonly idService: IdService,
	) {}

	async create(
		name: string,
		description: string,
		userId: string,
	): Promise<OrganizationDatabase> {
		const id = await this.idService.generatePrefixedId('org_');
		const now = new Date();
		const newOrg: OrganizationDatabase = {
			id,
			name,
			description,
			createdAt: now,
		};

		return this.organizationRepository.createOrganization(newOrg, userId);
	}

	async getOrganizationById(
		id: string,
		userId: string,
	): Promise<OrganizationDatabase> {
		const orgInfo =
			await this.organizationRepository.getOrganizationById(id);

		if (!(await this.getUserRoleInOrganization(id, userId))) {
			throw new ForbiddenException(
				'Only members of the organization can view its details',
			);
		}
		if (!orgInfo) {
			throw new NotFoundException(`Organization with ID ${id} not found`);
		}

		return orgInfo;
	}

	// update(id: string, name: string, description: string): Promise<OrganizationDatabase> {

	// }

	async deleteOrganization(id: string, userId: string): Promise<void> {
		const memberRole = await this.getUserRoleInOrganization(id, userId);

		if (memberRole !== OrgRoles.LEADER) {
			throw new ForbiddenException(
				'Only the organization leader can delete the organization',
			);
		}
		this.organizationRepository.deleteOrganization(id);
	}

	async getOrganizationsByUserId(
		userId: string,
	): Promise<OrganizationDatabase[]> {
		const org =
			await this.organizationRepository.getOrganizationsByUserId('1');
		if (!org) {
			throw new NotFoundException(
				`User with ID ${userId} not found in any organization`,
			);
		}
		return org;
	}

	async addUser(
		orgId: string,
		email: string,
		role: OrgRoles,
		currentUserId: string,
	): Promise<void> {
		const userRole = await this.getUserRoleInOrganization(
			orgId,
			currentUserId,
		);

		if (userRole === OrgRoles.MEMBER) {
			throw new ForbiddenException(
				'Insufficient permissions to add users',
			);
		}

		if (!email) {
			throw new NotFoundException('Email is required');
		}

		const userToAddId = (await this.userRepository.getUserByEmail(email))
			.id;

		await this.organizationRepository.addMemberToOrganization(
			orgId,
			userToAddId,
			role,
		);
	}

	async removeUserFrom(
		orgId: string,
		userId: string,
		removeUserId: string,
	): Promise<void> {
		const userRole = await this.getUserRoleInOrganization(orgId, userId);

		if (userRole === OrgRoles.MEMBER) {
			// TODO: i can remove my own user
			throw new NotFoundException(
				`User with ID ${removeUserId} not found in organization or insufficient permissions`,
			);
		}

		await this.organizationRepository.deleteMemberFromOrganization(
			orgId,
			removeUserId,
		);
	}

	private async getUserRoleInOrganization(
		orgId: string,
		userId: string,
	): Promise<OrgRoles> {
		const userOrg =
			await this.organizationRepository.getMemberFromOrganization(
				orgId,
				userId,
			);

		if (!userOrg) {
			throw new NotFoundException(
				`User with ID ${userId} not found in organization`,
			);
		}
		return userOrg.role;
	}
}
