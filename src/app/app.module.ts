import { LogModule } from '@log/log.module';
//import { DatabaseModule } from '@database/database.module';
import { LoginModule } from '@login/login.module';
import { Module } from '@nestjs/common';

@Module({
	imports: [LoginModule, LogModule],
})
export class AppModule {}
