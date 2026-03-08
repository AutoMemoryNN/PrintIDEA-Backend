import { TaskPriorities, TaskStatus } from '@database/database.schema';

export type CreateProjectDto = {
	name: string;
	description: string;
	status: TaskStatus;
	startDate: Date;
	endDate: Date;
	priority: TaskPriorities;
};

export type UpdateProjectDto = Partial<CreateProjectDto>;
