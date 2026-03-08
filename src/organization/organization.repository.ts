import { Schema } from '@database/database.schema';
import { Inject, Injectable } from '@nestjs/common';
import {
	OrgRoles,
	OrganizationDatabase,
	UserOrganizationDatabase,
} from '@type/index';
import { and, eq, or } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class OrganizationRepository {
	constructor(
		@Inject('APP-DB')
		private readonly db: PostgresJsDatabase<typeof Schema>,
	) {}

	async getOrganizationById(id: string): Promise<OrganizationDatabase> {
		const organizations = Schema.organizations;
		const result = await this.db
			.select({
				id: organizations.id,
				name: organizations.name,
				description: organizations.description,
				createdAt: organizations.createdAt,
			})
			.from(organizations)
			.where(eq(organizations.id, id))
			.limit(1);
		return result[0];
	}

	async getOrganizationsByUserId(
		userId: string,
	): Promise<OrganizationDatabase[]> {
		const organizations = Schema.organizations;
		const userOrganization = Schema.userOrganization;

		const orgIds = await this.db
			.select({ organizationId: userOrganization.organizationId })
			.from(userOrganization)
			.where(eq(userOrganization.userId, userId));

		if (orgIds.length === 0) {
			return [];
		}

		const result = await this.db
			.select({
				id: organizations.id,
				name: organizations.name,
				description: organizations.description,
				createdAt: organizations.createdAt,
			})
			.from(organizations)
			.where(
				or(
					...orgIds.map((org) =>
						eq(organizations.id, org.organizationId),
					),
				),
			);
		return result;
	}

	async createOrganization(
		organization: OrganizationDatabase,
		leaderId: string,
	): Promise<OrganizationDatabase> {
		const organizations = Schema.organizations;
		const result = await this.db
			.insert(organizations)
			.values(organization)
			.returning();

		const userOrganization = Schema.userOrganization;
		await this.db.insert(userOrganization).values({
			userId: leaderId,
			organizationId: result[0].id,
			role: OrgRoles.LEADER,
		});
		return result[0];
	}

	async deleteOrganization(id: string): Promise<OrganizationDatabase> {
		const organizations = Schema.organizations;
		const result = await this.db
			.delete(organizations)
			.where(eq(organizations.id, id))
			.returning();
		return result[0];
	}

	async deleteMemberFromOrganization(
		orgId: string,
		userId: string,
	): Promise<void> {
		const userOrganization = Schema.userOrganization;
		await this.db
			.delete(userOrganization)
			.where(
				and(
					eq(userOrganization.organizationId, orgId),
					eq(userOrganization.userId, userId),
				),
			);
	}

	async getMemberFromOrganization(
		orgId: string,
		userId: string,
	): Promise<UserOrganizationDatabase> {
		const userOrganization = Schema.userOrganization;
		const result = await this.db
			.select({
				userId: userOrganization.userId,
				organizationId: userOrganization.organizationId,
				role: userOrganization.role,
			})
			.from(userOrganization)
			.where(
				and(
					eq(userOrganization.organizationId, orgId),
					eq(userOrganization.userId, userId),
				),
			);

		return result[0];
	}

	async addMemberToOrganization(
		orgId: string,
		userId: string,
		role: OrgRoles,
	): Promise<void> {
		const userOrganization = Schema.userOrganization;
		await this.db.insert(userOrganization).values({
			userId,
			organizationId: orgId,
			role,
		});
	}
}
