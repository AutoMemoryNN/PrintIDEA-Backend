import { BoardModule } from '@board/board.module';
import { DatabaseModule } from '@database/database.module';
import { LogModule } from '@log/log.module';
import { LoginModule } from '@login/login.module';
import { Module } from '@nestjs/common';
import { OrganizationModule } from '@org/organization.module';
import { ProjectModule } from '@projects/project.module';
import { UserModule } from '@user/user.module';
import { SecurityModule } from 'src/security/security.module';

@Module({
	imports: [
		LoginModule,
		SecurityModule,
		LogModule,
		UserModule,
		OrganizationModule,
		DatabaseModule,
		ProjectModule,
		BoardModule,
	],
})
export class AppModule {}
