import { Module } from '@nestjs/common';
import { ProjectController } from '@projects/project.controller';
import { ProjectService } from '@projects/project.service';

@Module({
	imports: [],
	controllers: [ProjectController],
	providers: [ProjectService],
	exports: [ProjectService],
})
export class ProjectModule {}
