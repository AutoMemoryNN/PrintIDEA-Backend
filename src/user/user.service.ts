import { Injectable } from '@nestjs/common';
import { UserDatabase } from '@type/index';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
	constructor(private userRepository: UserRepository) {}

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
}
