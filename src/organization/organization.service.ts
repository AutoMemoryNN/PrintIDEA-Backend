import { Injectable, NotFoundException } from '@nestjs/common';

export type Organization = {
	id: string;
	name: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
};

// Temporal Class
@Injectable()
export class OrganizationService {
	private idCounter = 1;

	create(name: string, description: string, userId: string): Organization {
		const id = `org_${this.idCounter++}`;
		const now = new Date();
		console.log(`User ID: ${userId}`);

		const newOrg: Organization = {
			id,
			name,
			description,
			createdAt: now,
			updatedAt: now,
		};

		console.log('Creating Organization:', newOrg);
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
			updatedAt: now,
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
}
