import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IdService {
	private readonly nanoid;

	constructor() {
		this.nanoid = customAlphabet(
			'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
			12,
		);
	}

	generateShortId(): string {
		return this.nanoid();
	}

	generateUuid(): string {
		return uuidv4();
	}

	generatePrefixedId(prefix: string): string {
		return `${prefix}_${this.nanoid()}`;
	}
}
