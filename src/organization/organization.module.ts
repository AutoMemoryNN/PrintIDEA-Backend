import { Module } from '@nestjs/common';
import { OrganizationController } from '@org/organization.controller';
import { OrganizationService } from '@org/organization.service';
import { SecurityModule } from '@security/security.module';

@Module({
	imports: [SecurityModule],
	controllers: [OrganizationController],
	providers: [OrganizationService],
})
export class OrganizationModule {}
