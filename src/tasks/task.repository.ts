import { Schema } from '@database/database.schema';
import { Inject, Injectable } from '@nestjs/common';
import { ITaskRepository } from '@task/interfaces/task.repository.interface';
import { TaskDatabase } from '@type/index';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class TaskRepository implements ITaskRepository {
	constructor(
		@Inject('APP-DB')
		private readonly db: PostgresJsDatabase<typeof Schema>,
	) {}

	async createTask(task: TaskDatabase): Promise<TaskDatabase> {
		const tasks = Schema.tasks;

		const result = await this.db
			.insert(tasks)
			.values({
				id: task.id,
				title: task.title,
				description: task.description,
				priority: task.priority,
				initDate: task.initDate,
				tag: task.tag,
				endDate: task.endDate,
				status: task.status,
				projectId: task.projectId,
				createdAt: task.createdAt || new Date(),
			})
			.returning({
				id: tasks.id,
				title: tasks.title,
				description: tasks.description,
				priority: tasks.priority,
				initDate: tasks.initDate,
				tag: tasks.tag,
				endDate: tasks.endDate,
				status: tasks.status,
				projectId: tasks.projectId,
				createdAt: tasks.createdAt,
			});

		return result[0];
	}

	async findTaskById(id: string): Promise<TaskDatabase> {
		const tasks = Schema.tasks;

		const result = await this.db
			.select()
			.from(tasks)
			.where(eq(tasks.id, id))
			.limit(1);

		return result[0];
	}

	async findAllTasks(projectId?: string): Promise<TaskDatabase[]> {
		const tasks = Schema.tasks;

		if (projectId) {
			return await this.db
				.select()
				.from(tasks)
				.where(eq(tasks.projectId, projectId));
		}

		return await this.db.select().from(tasks);
	}

	async updateTask(
		id: string,
		taskData: Partial<TaskDatabase>,
	): Promise<TaskDatabase> {
		const tasks = Schema.tasks;

		const result = await this.db
			.update(tasks)
			.set({
				...taskData,
			})
			.where(eq(tasks.id, id))
			.returning();

		return result[0];
	}

	async deleteTask(id: string): Promise<TaskDatabase> {
		const tasks = Schema.tasks;

		const result = await this.db
			.delete(tasks)
			.where(eq(tasks.id, id))
			.returning();

		return result[0];
	}
}
