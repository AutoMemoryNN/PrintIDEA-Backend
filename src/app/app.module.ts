import { LogModule } from '@log/log.module';
//import { DatabaseModule } from '@database/database.module';
import { LoginModule } from '@login/login.module';
import { Module } from '@nestjs/common';
import { UserModule } from '@user/user.module';
import { SecurityModule } from 'src/security/security.module';

@Module({
	imports: [LoginModule, SecurityModule, LogModule, UserModule],
})
export class AppModule {}
