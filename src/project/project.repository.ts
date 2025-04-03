import { Schema, TaskPriorities, TaskStatus } from '@database/database.schema';
import { Inject, Injectable } from '@nestjs/common';
import { ProjectDatabase } from '@type/index';
import { and, eq, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class ProjectRepository {
	constructor(
		@Inject('APP-DB')
		private readonly db: PostgresJsDatabase<typeof Schema>,
	) {}

	async getProjectById(id: string): Promise<ProjectDatabase> {
		const projects = Schema.projects;
		const result = await this.db
			.select({
				id: projects.id,
				name: projects.name,
				description: projects.description,
				status: projects.status,
				startDate: projects.startDate,
				endDate: projects.endDate,
				priority: projects.priority,
				organizationId: projects.organizationId,
			})
			.from(projects)
			.where(eq(projects.id, id))
			.limit(1);
		return result[0];
	}

	async getProjectsByOrganizationId(
		organizationId: string,
	): Promise<ProjectDatabase[]> {
		const projects = Schema.projects;
		const result = await this.db
			.select({
				id: projects.id,
				name: projects.name,
				description: projects.description,
				status: projects.status,
				startDate: projects.startDate,
				endDate: projects.endDate,
				priority: projects.priority,
				organizationId: projects.organizationId,
			})
			.from(projects)
			.where(eq(projects.organizationId, organizationId));
		return result;
	}

	async createProject(project: ProjectDatabase): Promise<ProjectDatabase> {
		try {
			const result = await this.db.execute(
				sql`INSERT INTO projects (
					id, 
					name, 
					description, 
					organization_id, 
					status, 
					start_date, 
					end_date, 
					priority
				) VALUES (
					${project.id || null}, 
					${project.name || null}, 
					${project.description || null}, 
					${project.organizationId || null}, 
					${project.status || TaskStatus.PENDING}, 
					${project.startDate || null}, 
					${project.endDate || null}, 
					${project.priority || TaskPriorities.LOW}
				) RETURNING *`,
			);

			return result[0] as ProjectDatabase;
		} catch (error) {
			throw new Error(`Error creating project: ${error.message}`);
		}
	}

	async updateProject(
		id: string,
		organizationId: string,
		projectData: Partial<ProjectDatabase>,
	): Promise<ProjectDatabase> {
		const projects = Schema.projects;
		const result = await this.db
			.update(projects)
			.set({
				...projectData,
			})
			.where(
				and(
					eq(projects.id, id),
					eq(projects.organizationId, organizationId),
				),
			)
			.returning();
		return result[0];
	}

	async deleteProject(
		id: string,
		organizationId: string,
	): Promise<ProjectDatabase> {
		const projects = Schema.projects;
		const result = await this.db
			.delete(projects)
			.where(
				and(
					eq(projects.id, id),
					eq(projects.organizationId, organizationId),
				),
			)
			.returning();
		return result[0];
	}
}
