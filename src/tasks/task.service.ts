import { LogService } from '@log/log.service';
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { OrganizationService } from '@org/organization.service';
import { ProjectService } from '@projects/project.service';
import { IdService } from '@security/uuid.security';
import { ITaskRepository } from '@task/interfaces/task.repository.interface';
import { ITaskService } from '@task/interfaces/task.service.interface';
import { CreateTaskDto, UpdateTaskDto } from '@task/task.dto';
import { TASK_REPOSITORY } from '@task/task.tokens';
import { OrgRoles, TaskDatabase } from '@type/index';

@Injectable()
export class TaskService implements ITaskService {
	private readonly logger = new LogService(TaskService.name);

	constructor(
		@Inject(TASK_REPOSITORY)
		private readonly taskRepository: ITaskRepository,
		private readonly projectService: ProjectService,
		private readonly organizationService: OrganizationService,
		private readonly idService: IdService,
	) {}

	async createTask(
		projectId: string,
		userId: string,
		taskData: CreateTaskDto,
	): Promise<TaskDatabase> {
		this.logger.log(
			`Creating new task in project ${projectId} by user ${userId}`,
		);

		try {
			// Validate dates
			if (new Date(taskData.initDate) > new Date(taskData.endDate)) {
				this.logger.warn(
					`Task date validation failed: initDate (${taskData.initDate}) is after endDate (${taskData.endDate})`,
				);
				throw new BadRequestException(
					'Start date must be before end date',
				);
			}

			// Get project to verify it exists and get organizationId
			const project = await this.projectService.getProjectById(projectId);

			if (!project) {
				this.logger.warn(`Project ${projectId} not found`);
				throw new NotFoundException(
					`Project with ID ${projectId} not found`,
				);
			}

			const organizationId = project.organizationId;

			// Verify user has permission to create tasks in this project
			const userRole =
				await this.organizationService.getUserRoleInOrganization(
					organizationId,
					userId,
				);

			if (!userRole) {
				this.logger.warn(
					`User ${userId} attempted to create task without membership in organization ${organizationId}`,
				);
				throw new ForbiddenException(
					'User does not have access to this organization',
				);
			}

			const taskId = await this.idService.generatePrefixedId('task_');

			const taskToCreate: TaskDatabase = {
				id: taskId,
				title: taskData.title,
				description: taskData.description,
				tag: taskData.tag || null,
				priority: taskData.priority,
				initDate: new Date(taskData.initDate),
				endDate: new Date(taskData.endDate),
				status: taskData.status,
				projectId,
				createdAt: new Date(),
			};

			const createdTask =
				await this.taskRepository.createTask(taskToCreate);

			this.logger.log(
				`Task ${createdTask.id} created successfully for project ${projectId}`,
			);

			return createdTask;
		} catch (error) {
			if (
				error instanceof BadRequestException ||
				error instanceof NotFoundException ||
				error instanceof ForbiddenException
			) {
				throw error;
			}

			this.logger.error(
				`Failed to create task: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error creating task: ${error.message}`,
			);
		}
	}

	async findById(id: string, userId: string): Promise<TaskDatabase> {
		this.logger.log(`Fetching task ${id} for user ${userId}`);

		try {
			const task = await this.taskRepository.findTaskById(id);

			if (!task) {
				this.logger.warn(`Task ${id} not found`);
				throw new NotFoundException(`Task with ID ${id} not found`);
			} // Get project and organization to verify user access
			const project = await this.projectService.getProjectById(
				task.projectId,
			);

			if (!project) {
				this.logger.warn(
					`Project ${task.projectId} not found for task ${id}`,
				);
				throw new NotFoundException('Project for task not found');
			}

			const userRole =
				await this.organizationService.getUserRoleInOrganization(
					project.organizationId,
					userId,
				);

			if (!userRole) {
				this.logger.warn(
					`Access denied: User ${userId} attempted to access task ${id} without organization membership`,
				);
				throw new ForbiddenException(
					'User does not have access to this task',
				);
			}

			return task;
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof ForbiddenException
			) {
				throw error;
			}

			this.logger.error(
				`Failed to fetch task ${id}: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error fetching task: ${error.message}`,
			);
		}
	}

	async findAll(userId: string, projectId?: string): Promise<TaskDatabase[]> {
		this.logger.log(
			`Fetching tasks for user ${userId}${
				projectId ? ` for project ${projectId}` : ''
			}`,
		);

		try {
			if (projectId) {
				// If projectId is provided, verify the project exists and user has access
				const project =
					await this.projectService.getProjectById(projectId);

				if (!project) {
					this.logger.warn(`Project ${projectId} not found`);
					throw new NotFoundException(
						`Project with ID ${projectId} not found`,
					);
				}

				const userRole =
					await this.organizationService.getUserRoleInOrganization(
						project.organizationId,
						userId,
					);

				if (!userRole) {
					this.logger.warn(
						`Access denied: User ${userId} attempted to access tasks for project ${projectId} without organization membership`,
					);
					throw new ForbiddenException(
						'User does not have access to this project',
					);
				}

				return this.taskRepository.findAllTasks(projectId);
			}

			// If no projectId, return tasks for all projects user has access to
			// This implementation could be improved for large datasets with pagination
			const orgs =
				await this.organizationService.getOrganizationsByUserId(userId);

			if (orgs.length === 0) {
				return [];
			}

			// For admin users, return all tasks
			// For regular users, filter by projects they have access to
			const allTasks = await this.taskRepository.findAllTasks();

			const accessibleProjects = new Set<string>();

			// For each organization, get projects and add to accessible set
			for (const org of orgs) {
				const projects = await this.projectService.getProjectsByOrgId(
					org.id,
					userId,
				);

				for (const project of projects) {
					accessibleProjects.add(project.id);
				}
			}

			return allTasks.filter((task) =>
				accessibleProjects.has(task.projectId),
			);
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof ForbiddenException
			) {
				throw error;
			}

			this.logger.error(
				`Failed to fetch tasks: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error fetching tasks: ${error.message}`,
			);
		}
	}

	async updateTask(
		id: string,
		userId: string,
		taskData: UpdateTaskDto,
	): Promise<TaskDatabase> {
		this.logger.log(`Updating task ${id} by user ${userId}`);

		try {
			// Validate the task exists
			const existingTask = await this.taskRepository.findTaskById(id);

			if (!existingTask) {
				this.logger.warn(`Task ${id} not found`);
				throw new NotFoundException(`Task with ID ${id} not found`);
			}

			// Get project to verify user permissions
			const project = await this.projectService.getProjectById(
				existingTask.projectId,
			);
			const userRole =
				await this.organizationService.getUserRoleInOrganization(
					project.organizationId,
					userId,
				);

			if (!userRole) {
				this.logger.warn(
					`Access denied: User ${userId} attempted to update task ${id} without organization membership`,
				);
				throw new ForbiddenException(
					'User does not have access to this task',
				);
			}

			// Only admin and leader roles can modify tasks unless they are specified otherwise
			if (![OrgRoles.ADMIN, OrgRoles.LEADER].includes(userRole)) {
				this.logger.warn(
					`Permission denied: User ${userId} with role ${userRole} attempted to update task ${id}`,
				);
				throw new ForbiddenException(
					'User does not have permission to update this task',
				);
			}

			// Date validation if both dates are provided
			if (taskData.initDate && taskData.endDate) {
				if (new Date(taskData.initDate) > new Date(taskData.endDate)) {
					this.logger.warn(
						`Task date validation failed: initDate (${taskData.initDate}) is after endDate (${taskData.endDate})`,
					);
					throw new BadRequestException(
						'Start date must be before end date',
					);
				}
			} else if (taskData.initDate && !taskData.endDate) {
				// If only start date provided, check against existing end date
				if (
					new Date(taskData.initDate) > new Date(existingTask.endDate)
				) {
					throw new BadRequestException(
						'Start date must be before end date',
					);
				}
			} else if (!taskData.initDate && taskData.endDate) {
				// If only end date provided, check against existing start date
				if (
					new Date(existingTask.initDate) > new Date(taskData.endDate)
				) {
					throw new BadRequestException(
						'Start date must be before end date',
					);
				}
			}

			// Update the task
			const updatedTask = await this.taskRepository.updateTask(id, {
				...taskData,
				initDate: taskData.initDate
					? new Date(taskData.initDate)
					: undefined,
				endDate: taskData.endDate
					? new Date(taskData.endDate)
					: undefined,
			});

			this.logger.log(`Task ${id} updated successfully`);

			return updatedTask;
		} catch (error) {
			if (
				error instanceof BadRequestException ||
				error instanceof NotFoundException ||
				error instanceof ForbiddenException
			) {
				throw error;
			}

			this.logger.error(
				`Failed to update task ${id}: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error updating task: ${error.message}`,
			);
		}
	}

	async deleteTask(id: string, userId: string): Promise<void> {
		this.logger.log(`Deleting task ${id} by user ${userId}`);

		try {
			// Validate the task exists
			const existingTask = await this.taskRepository.findTaskById(id);

			if (!existingTask) {
				this.logger.warn(`Task ${id} not found`);
				throw new NotFoundException(`Task with ID ${id} not found`);
			}

			// Get project to verify user permissions
			const project = await this.projectService.getProjectById(
				existingTask.projectId,
			);
			const userRole =
				await this.organizationService.getUserRoleInOrganization(
					project.organizationId,
					userId,
				);

			if (!userRole) {
				this.logger.warn(
					`Access denied: User ${userId} attempted to delete task ${id} without organization membership`,
				);
				throw new ForbiddenException(
					'User does not have access to this task',
				);
			}

			// Only admin and leader roles can delete tasks
			if (![OrgRoles.ADMIN, OrgRoles.LEADER].includes(userRole)) {
				this.logger.warn(
					`Permission denied: User ${userId} with role ${userRole} attempted to delete task ${id}`,
				);
				throw new ForbiddenException(
					'User does not have permission to delete this task',
				);
			}

			// Delete the task
			const deletedTask = await this.taskRepository.deleteTask(id);

			if (!deletedTask) {
				throw new NotFoundException(
					`Task with ID ${id} not found or already deleted`,
				);
			}

			this.logger.log(`Task ${id} deleted successfully`);
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof ForbiddenException
			) {
				throw error;
			}

			this.logger.error(
				`Failed to delete task ${id}: ${error.message}`,
				error.stack,
			);
			throw new InternalServerErrorException(
				`Error deleting task: ${error.message}`,
			);
		}
	}
}
