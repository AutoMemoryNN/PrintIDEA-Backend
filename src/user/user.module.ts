import { Module } from '@nestjs/common';

import { UserController } from '@user/user.controller';
import { UserService } from '@user/user.service';

@Module({
	providers: [UserService],
	controllers: [UserController],
})
export class UserModule {}
