import { Module } from '@nestjs/common';

import { UserController } from '@user/user.controller';
import { UserRepository } from '@user/user.repository';
import { UserService } from '@user/user.service';

@Module({
	providers: [UserService, UserRepository],
	controllers: [UserController],
	exports: [UserService, UserRepository],
})
export class UserModule {}
