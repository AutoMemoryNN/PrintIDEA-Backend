import { BoardModule } from '@board/board.module';
import { Module } from '@nestjs/common';
import { OrganizationModule } from '@org/organization.module';
import { ProjectController } from '@projects/project.controller';
import { ProjectService } from '@projects/project.service';
import { SecurityModule } from '@security/security.module';
import { ProjectRepository } from './project.repository';

@Module({
	imports: [OrganizationModule, SecurityModule, BoardModule],
	controllers: [ProjectController],
	providers: [ProjectService, ProjectRepository],
	exports: [ProjectService],
})
export class ProjectModule {}
