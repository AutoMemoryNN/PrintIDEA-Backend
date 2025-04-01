import { LogService } from '@log/log.service';
import { Injectable } from '@nestjs/common';
import { UserDatabase, UserRoles } from '@type/index';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
	constructor(
		private userRepository: UserRepository,
		private logService: LogService,
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
