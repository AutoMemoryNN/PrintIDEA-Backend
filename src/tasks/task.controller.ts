import {
	Body,
	Controller,
	Delete,
	Get,
	Inject,
	Param,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserId } from '@security/security.decorators';
import { ITaskService } from '@task/interfaces/task.service.interface';
import { CreateTaskDto, UpdateTaskDto } from '@task/task.dto';
import { TASK_SERVICE } from '@task/task.tokens';
import { ControllerResponse, TaskDatabase } from '@type/index';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
	constructor(
		@Inject(TASK_SERVICE)
		private readonly taskService: ITaskService,
	) {}

	@Get()
	@ApiOperation({
		summary: 'Get all tasks',
		description: 'Retrieves all tasks, optionally filtered by project ID',
	})
	@ApiQuery({
		name: 'projectId',
		required: false,
		description: 'Optional project ID to filter tasks',
	})
	async getTasks(
		@UserId() userId: string,
		@Query('projectId') projectId?: string,
	): Promise<ControllerResponse<TaskDatabase[]>> {
		const tasks = await this.taskService.findAll(userId, projectId);
		return {
			message: 'Tasks retrieved successfully',
			data: tasks,
		};
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a task by ID',
		description: 'Retrieves a specific task by its ID',
	})
	async getTaskById(
		@Param('id') id: string,
		@UserId() userId: string,
	): Promise<ControllerResponse<TaskDatabase>> {
		const task = await this.taskService.findById(id, userId);
		return {
			message: 'Task retrieved successfully',
			data: task,
		};
	}

	@Post()
	@ApiOperation({
		summary: 'Create a new task',
		description: 'Creates a new task in a specific project',
	})
	async createTask(
		@UserId() userId: string,
		@Body() createTaskDto: CreateTaskDto,
	): Promise<ControllerResponse<TaskDatabase>> {
		const task = await this.taskService.createTask(
			createTaskDto.projectId,
			userId,
			createTaskDto,
		);
		return {
			message: `Task created successfully with ID ${task.id}`,
			data: task,
		};
	}

	@Put(':id')
	@ApiOperation({
		summary: 'Update a task',
		description: 'Updates an existing task by its ID',
	})
	async updateTask(
		@Param('id') id: string,
		@UserId() userId: string,
		@Body() updateTaskDto: UpdateTaskDto,
	): Promise<ControllerResponse<TaskDatabase>> {
		const task = await this.taskService.updateTask(
			id,
			userId,
			updateTaskDto,
		);
		return {
			message: 'Task updated successfully',
			data: task,
		};
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete a task',
		description: 'Deletes a task by its ID',
	})
	async deleteTask(
		@Param('id') id: string,
		@UserId() userId: string,
	): Promise<ControllerResponse> {
		await this.taskService.deleteTask(id, userId);
		return {
			message: `Task with ID ${id} deleted successfully`,
		};
	}
}
