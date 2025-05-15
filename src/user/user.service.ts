import { LogService } from '@log/log.service';
import { Injectable } from '@nestjs/common';
import { UserDatabase, UserRoles } from '@type/index';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly logService: LogService,
	) {}

	readonly context = 'UserService';

	async createUser(user: UserDatabase): Promise<UserDatabase> {
		let newUser = await this.userRepository.getUserByEmail(user.email);
		if (newUser) {
			throw new Error('User already exists cannot create a new one');
		}
		newUser = await this.userRepository.insertUser(user);
		return newUser;
	}

	async getUserByEmail(email: string): Promise<UserDatabase> {
		const user = await this.userRepository.getUserByEmail(email);
		if (!user) {
			throw new Error('User not found');
		}
		return user;
	}

	async verifyUserByEmail(email: string): Promise<boolean> {
		const user = await this.userRepository.getUserByEmail(email);
		if (!user) {
			return false;
		}
		return true;
	}

	async deleteUserByEmail(
		targetEmail: string,
		role: UserRoles,
		userId: string,
	): Promise<void> {
		const user = await this.userRepository.getUserByEmail(targetEmail);
		if (!user) {
			this.logService.error(
				`User with email ${targetEmail} not found`,
				this.context,
			);
			return;
		}
		if (!this.verifyElevatedPermissions(userId, user.id, role)) {
			throw new Error('Unauthorized action');
		}
		await this.userRepository.deleteUserByEmail(targetEmail);
	}

	async updateUser(
		targetId: string,
		userId: string,
		alias: string,
		name: string,
		email: string,
	): Promise<UserDatabase> {
		const user = await this.userRepository.getUserById(targetId);
		if (!user) {
			this.logService.error(
				`User with id ${targetId} not found`,
				this.context,
			);
			return;
		}
		this.logService.log(
			`User with id ${userId} is trying to update user with id ${targetId}`,
			this.context,
		);
		if (!this.verifyElevatedPermissions(userId, user.id, user.role)) {
			this.logService.error(
				`User with id ${userId} tried to operate on user with id ${targetId} without elevated permissions`,
				this.context,
			);
			throw new Error('Unauthorized action');
		}
		this.logService.log(
			`User with id ${userId} has elevated permissions to update user with id ${targetId}`,
			this.context,
		);
		const updatedUser = await this.userRepository.updateUser({
			id: user.id,
			name: name,
			email: email,
			alias: alias,
			role: user.role,
		});
		this.logService.log(
			`User with alias ${user.alias} name ${user.name} and email ${user.email} updated to ${updatedUser.alias} ${updatedUser.name} ${updatedUser.email}`,
			this.context,
		);
		return updatedUser;
	}

	async getUserById(id: string): Promise<UserDatabase> {
		const user = await this.userRepository.getUserById(id);
		if (!user) {
			this.logService.error(`User with id ${id} not found`, this.context);
			throw new Error('User not found');
		}
		this.logService.log(
			`User with id ${id} found with name ${user.name} and email ${user.email}`,
			this.context,
		);
		return user;
	}

	verifyElevatedPermissions(
		userId: string,
		userAffected: string,
		role: UserRoles,
	): boolean {
		if (role !== UserRoles.ADMIN && userId !== userAffected) {
			this.logService.error(
				`User with id ${userId} tried to operate on user with id ${userAffected} without elevated permissions`,
				this.context,
			);
			return false;
		}
		if (role === UserRoles.ADMIN) {
			return true;
		}
		if (userId === userAffected) {
			return true;
		}

		this.logService.error(
			`User with id ${userId} tried to operate on user with id ${userAffected} without elevated permissions`,
			this.context,
		);

		return false;
	}
}
