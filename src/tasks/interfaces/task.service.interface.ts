import { CreateTaskDto, UpdateTaskDto } from '@task/task.dto';
import { TaskDatabase } from '@type/index';

// biome-ignore lint/style/useNamingConvention: "Naming convention is not important in this case"
export interface ITaskService {
	/**
	 * Creates a new task
	 */
	createTask(
		projectId: string,
		userId: string,
		taskData: CreateTaskDto,
	): Promise<TaskDatabase>;

	/**
	 * Finds a task by its ID
	 */
	findById(id: string, userId: string): Promise<TaskDatabase>;

	/**
	 * Gets all tasks, optionally filtered by project ID
	 */
	findAll(userId: string, projectId?: string): Promise<TaskDatabase[]>;

	/**
	 * Updates a task
	 */
	updateTask(
		id: string,
		userId: string,
		taskData: UpdateTaskDto,
	): Promise<TaskDatabase>;

	/**
	 * Deletes a task
	 */
	deleteTask(id: string, userId: string): Promise<void>;
}
