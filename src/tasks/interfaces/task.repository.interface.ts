import { TaskDatabase } from '@type/index';

// biome-ignore lint/style/useNamingConvention: "Naming convention is not important in this case"
export interface ITaskRepository {
	/**
	 * Creates a new task
	 */
	createTask(task: TaskDatabase): Promise<TaskDatabase>;

	/**
	 * Finds a task by its ID
	 */
	findTaskById(id: string): Promise<TaskDatabase>;

	/**
	 * Gets all tasks, optionally filtered by project ID
	 */
	findAllTasks(projectId?: string): Promise<TaskDatabase[]>;

	/**
	 * Updates a task
	 */
	updateTask(
		id: string,
		taskData: Partial<TaskDatabase>,
	): Promise<TaskDatabase>;

	/**
	 * Deletes a task
	 */
	deleteTask(id: string): Promise<TaskDatabase>;
}
