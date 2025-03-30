import { Injectable, NotFoundException } from '@nestjs/common';

export type Organization = {
	id: string;
	name: string;
	description: string;
	createdAt: Date;
};

// Temporal Class
@Injectable()
export class OrganizationService {
	private idCounter = 1;
	private organizationsMap = new Map<string, Organization[]>();

	create(name: string, description: string, userId: string): Organization {
		const id = `org_${this.idCounter++}`;
		const now = new Date();
		console.log(`User ID: ${userId}`);

		const newOrg: Organization = {
			id,
			name,
			description,
			createdAt: now,
		};

		console.log('Creating Organization:', newOrg);
		const userOrgs = this.organizationsMap.get(userId) || [];
		userOrgs.push(newOrg);
		this.organizationsMap.set(userId, userOrgs);
		return newOrg;
	}

	update(id: string, name: string, description: string): Organization {
		if (!id.startsWith('org_')) {
			throw new NotFoundException(`Organization with ID ${id} not found`);
		}

		const now = new Date();

		const updatedOrg: Organization = {
			id,
			name,
			description,
			createdAt: now,
		};

		console.log('Updating Organization:', updatedOrg);
		return updatedOrg;
	}

	remove(id: string): void {
		if (!id.startsWith('org_')) {
			throw new NotFoundException(`Organization with ID ${id} not found`);
		}
		console.log(`Removing Organization with ID ${id}`);
	}

	getOrgsByUserId(userId: string): Organization[] | undefined {
		const org = this.organizationsMap.get(userId);

		if (!org) {
			throw new NotFoundException(
				`Organization with ID ${userId} not found`,
			);
		}
		return org;
	}

	addUser(mail: string, role: string, userId: string): void {
		if (!mail) {
			throw new NotFoundException(`User with ID ${userId} not found`);
		}
		console.log(
			`Adding user with ID ${userId} to organization with role ${role}`,
		);
	}
}
