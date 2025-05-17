import { LogModule } from '@log/log.module';
import { Module } from '@nestjs/common';
import { OrganizationModule } from '@org/organization.module';
import { ProjectModule } from '@projects/project.module';
import { SecurityModule } from '@security/security.module';
import { TaskController } from '@task/task.controller';
import { TaskRepository } from '@task/task.repository';
import { TaskService } from '@task/task.service';
import { TASK_REPOSITORY, TASK_SERVICE } from '@task/task.tokens';

@Module({
	imports: [SecurityModule, LogModule, OrganizationModule, ProjectModule],
	controllers: [TaskController],
	providers: [
		{
			provide: TASK_REPOSITORY,
			useClass: TaskRepository,
		},
		{
			provide: TASK_SERVICE,
			useClass: TaskService,
		},
	],
	exports: [TASK_SERVICE, TASK_REPOSITORY],
})
export class TaskModule {}
