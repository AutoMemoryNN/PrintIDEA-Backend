import { TaskPriorities, TaskStatus } from '@database/database.schema';

/**
 * Data transfer object for creating a new task
 */
export type CreateTaskDto = {
	title: string;
	description: string;
	priority: TaskPriorities;
	status: TaskStatus;
	initDate: Date;
	endDate: Date;
	projectId: string;
	tag?: string;
};

/**
 * Data transfer object for updating an existing task
 */
export type UpdateTaskDto = {
	title?: string;
	description?: string;
	priority?: TaskPriorities;
	status?: TaskStatus;
	initDate?: Date;
	endDate?: Date;
	tag?: string;
};
