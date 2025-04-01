import { Module } from '@nestjs/common';
import { OrganizationController } from '@org/organization.controller';
import { OrganizationRepository } from '@org/organization.repository';
import { OrganizationService } from '@org/organization.service';
import { SecurityModule } from '@security/security.module';
import { UserModule } from '@user/user.module';

@Module({
	imports: [SecurityModule, UserModule],
	controllers: [OrganizationController],
	providers: [OrganizationService, OrganizationRepository],
	exports: [OrganizationService],
})
export class OrganizationModule {}
