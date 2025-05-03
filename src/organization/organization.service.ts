import { OrgRoles, UserRoles } from '@database/database.schema';
import { LogService } from '@log/log.service';
import {
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { OrganizationRepository } from '@org/organization.repository';
import { IdService } from '@security/uuid.security';
import { OrganizationDatabase } from '@type/index';
import { UserRepository } from '@user/user.repository';

@Injectable()
export class OrganizationService {
	private readonly logger = new LogService(OrganizationService.name);

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
		this.logger.log(
			`Creating new organization "${name}" for user ${userId}`,
		);

		try {
			const id = await this.idService.generatePrefixedId('org_');
			this.logger.log(`Generated organization ID: ${id}`);

			const now = new Date();
			const newOrg: OrganizationDatabase = {
				id,
				name,
				description,
				createdAt: now,
			};

			const createdOrg =
				await this.organizationRepository.createOrganization(
					newOrg,
					userId,
				);
			this.logger.log(
				`Successfully created organization ${createdOrg.id}: "${createdOrg.name}"`,
			);

			return createdOrg;
		} catch (error) {
			this.logger.error(
				`Failed to create organization "${name}": ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error creating organization: ${error.message}`,
			);
		}
	}

	async getOrganizationById(
		id: string,
		userId: string,
	): Promise<OrganizationDatabase> {
		this.logger.log(
			`Fetching organization ${id} details for user ${userId}`,
		);

		try {
			const orgInfo =
				await this.organizationRepository.getOrganizationById(id);

			if (!orgInfo) {
				this.logger.warn(
					`Organization ${id} not found when requested by user ${userId}`,
				);
				throw new NotFoundException(
					`Organization with ID ${id} not found`,
				);
			}

			try {
				const userRole = await this.getUserRoleInOrganization(
					id,
					userId,
				);
				this.logger.log(
					`User ${userId} has role ${userRole} in organization ${id}`,
				);
			} catch (error) {
				this.logger.warn(
					`Access denied: User ${userId} attempted to view organization ${id} without membership`,
				);
				throw new ForbiddenException(
					`User is not a member of this organization ${error}`,
				);
			}

			this.logger.log(
				`Successfully retrieved organization ${id}: "${orgInfo.name}"`,
			);
			return orgInfo;
		} catch (error) {
			if (
				error instanceof ForbiddenException ||
				error instanceof NotFoundException
			) {
				throw error;
			}

			this.logger.error(
				`Failed to retrieve organization ${id}: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error retrieving organization: ${error.message}`,
			);
		}
	}

	async deleteOrganization(id: string, userId: string): Promise<void> {
		this.logger.log(
			`Attempting to delete organization ${id} by user ${userId}`,
		);

		try {
			let memberRole: OrgRoles;
			try {
				memberRole = await this.getUserRoleInOrganization(id, userId);
			} catch (error) {
				this.logger.warn(
					`Access denied: User ${userId} attempted to delete organization ${id} without membership`,
				);
				throw new ForbiddenException(
					`User is not a member of this organization ${error}`,
				);
			}

			if (memberRole !== OrgRoles.LEADER) {
				this.logger.warn(
					`Permission denied: User ${userId} with role ${memberRole} attempted to delete organization ${id}`,
				);
				throw new ForbiddenException(
					'Only the organization leader can delete the organization',
				);
			}

			this.logger.log(
				`User ${userId} authorized to delete organization with role ${memberRole}`,
			);
			await this.organizationRepository.deleteOrganization(id);
			this.logger.log(`Successfully deleted organization ${id}`);
		} catch (error) {
			this.logger.error(
				`Failed to delete organization ${id}: ${error.message}`,
				error.stack,
			);
		}
	}

	async getOrganizationsByUserId(
		userId: string,
	): Promise<OrganizationDatabase[]> {
		this.logger.log(`Fetching organizations for user ${userId}`);

		try {
			const organizations =
				await this.organizationRepository.getOrganizationsByUserId(
					userId,
				);

			if (!organizations || organizations.length === 0) {
				this.logger.warn(`No organizations found for user ${userId}`);
				throw new NotFoundException(
					`User with ID ${userId} not found in any organization`,
				);
			}

			this.logger.log(
				`Successfully retrieved ${organizations.length} organizations for user ${userId}`,
			);
			return organizations;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}

			this.logger.error(
				`Failed to retrieve organizations for user ${userId}: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error retrieving organizations: ${error.message}`,
			);
		}
	}

	async addUser(
		orgId: string,
		email: string,
		role: OrgRoles,
		currentUserId: string,
	): Promise<void> {
		this.logger.log(
			`Adding user with email ${email} to organization ${orgId} with role ${role} by user ${currentUserId}`,
		);

		try {
			let userRole: OrgRoles;
			try {
				userRole = await this.getUserRoleInOrganization(
					orgId,
					currentUserId,
				);
			} catch (error) {
				this.logger.warn(
					`Access denied: User ${currentUserId} attempted to add member to organization ${orgId} without membership`,
				);
				throw new ForbiddenException(
					`User is not a member of this organization ${error}`,
				);
			}

			if (userRole === OrgRoles.MEMBER) {
				this.logger.warn(
					`Permission denied: User ${currentUserId} with role ${userRole} attempted to add member to organization ${orgId}`,
				);
				throw new ForbiddenException(
					'Insufficient permissions to add users',
				);
			}

			if (!email) {
				this.logger.warn(
					`Invalid request: User ${currentUserId} attempted to add member with empty email to organization ${orgId}`,
				);
				throw new NotFoundException('Email is required');
			}

			let userToAdd: {
				id: string;
				name: string;
				alias: string;
				email: string;
				role: UserRoles;
			};
			try {
				userToAdd = await this.userRepository.getUserByEmail(email);
				if (!userToAdd) {
					this.logger.warn(
						`User with email ${email} not found when attempting to add to organization ${orgId}`,
					);
					throw new NotFoundException(
						`User with email ${email} not found`,
					);
				}
			} catch (error) {
				this.logger.warn(
					`Failed to find user with email ${email}: ${error.message}`,
				);
				throw new NotFoundException(
					`User with email ${email} not found`,
				);
			}

			this.logger.log(
				`Adding user ${userToAdd.id} (${email}) to organization ${orgId} with role ${role}`,
			);
			await this.organizationRepository.addMemberToOrganization(
				orgId,
				userToAdd.id,
				role,
			);
			this.logger.log(
				`Successfully added user ${userToAdd.id} to organization ${orgId} with role ${role}`,
			);
		} catch (error) {
			if (
				error instanceof ForbiddenException ||
				error instanceof NotFoundException
			) {
				throw error;
			}

			this.logger.error(
				`Failed to add user with email ${email} to organization ${orgId}: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error adding user to organization: ${error.message}`,
			);
		}
	}

	async removeUserFrom(
		orgId: string,
		userId: string,
		removeUserId: string,
	): Promise<void> {
		this.logger.log(
			`Removing user ${removeUserId} from organization ${orgId} by user ${userId}`,
		);

		try {
			let userRole: OrgRoles;
			try {
				userRole = await this.getUserRoleInOrganization(orgId, userId);
			} catch (error) {
				this.logger.warn(
					`Access denied: User ${userId} attempted to remove member from organization ${orgId} without membership`,
				);
				throw new ForbiddenException(
					`User is not a member of this organization ${error}`,
				);
			}

			if (userRole === OrgRoles.MEMBER && userId !== removeUserId) {
				this.logger.warn(
					`Permission denied: User ${userId} with role ${userRole} attempted to remove user ${removeUserId} from organization ${orgId}`,
				);
				throw new ForbiddenException(
					'Insufficient permissions to remove other users from organization',
				);
			}

			// Allow users to remove themselves
			if (userId === removeUserId) {
				this.logger.log(
					`User ${userId} is removing themselves from organization ${orgId}`,
				);
			} else {
				this.logger.log(
					`User ${userId} with role ${userRole} is removing user ${removeUserId} from organization ${orgId}`,
				);
			}

			await this.organizationRepository.deleteMemberFromOrganization(
				orgId,
				removeUserId,
			);
			this.logger.log(
				`Successfully removed user ${removeUserId} from organization ${orgId}`,
			);
		} catch (error) {
			if (
				error instanceof ForbiddenException ||
				error instanceof NotFoundException
			) {
				throw error;
			}

			this.logger.error(
				`Failed to remove user ${removeUserId} from organization ${orgId}: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error removing user from organization: ${error.message}`,
			);
		}
	}

	async getUserRoleInOrganization(
		orgId: string,
		userId: string,
	): Promise<OrgRoles> {
		this.logger.log(
			`Checking role of user ${userId} in organization ${orgId}`,
		);

		try {
			const userOrg =
				await this.organizationRepository.getMemberFromOrganization(
					orgId,
					userId,
				);

			if (!userOrg) {
				this.logger.warn(
					`User ${userId} is not a member of organization ${orgId}`,
				);
				throw new NotFoundException(
					`User with ID ${userId} not found in organization`,
				);
			}

			this.logger.log(
				`User ${userId} has role ${userOrg.role} in organization ${orgId}`,
			);
			return userOrg.role;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}

			this.logger.error(
				`Failed to get role for user ${userId} in organization ${orgId}: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error retrieving user role: ${error.message}`,
			);
		}
	}
}
