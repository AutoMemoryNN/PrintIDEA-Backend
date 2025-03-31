// import { Schema } from '@database/database.schema';
// import { Inject, Injectable } from '@nestjs/common';
// import { eq } from 'drizzle-orm';
// import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
// import { OrgInfo } from './organization.dto';

// @Injectable()
// export class OrganizationRepository {
// 	constructor(
// 		@Inject('APP-DB') private db: PostgresJsDatabase<typeof Schema>,
// 	) {}

// 	async getOrganizationsByUserId(userId: string): Promise<OrgInfo[]> {
// 		const organizations = Schema.organizations;
// 		const userOrganization = Schema.userOrganization;
// 		const result = await this.db
// 			.select({
// 				organizationId: organizations.id,
// 				organizationName: organizations.name,
// 				organizationDescription: organizations.description,
// 			})
// 			.from(organizations)
// 			.leftJoin(
// 				organizations,
// 				eq(userOrganization.organizationId, organizations.id),
// 			)
// 			.where(eq(userOrganization.userId, userId));

// 		return result;
// 	}
// }
