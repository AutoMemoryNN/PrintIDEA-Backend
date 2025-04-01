import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IdService {
	private nanoid: () => string;
	private initialized = false;
	private readonly alphabet =
		'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	private readonly length = 12;

	private async initialize(): Promise<void> {
		if (!this.initialized) {
			const { customAlphabet } = await import('nanoid');
			this.nanoid = customAlphabet(this.alphabet, this.length);
			this.initialized = true;
		}
	}

	async generateShortId(): Promise<string> {
		await this.initialize();
		return this.nanoid();
	}

	generateUuid(): string {
		return uuidv4();
	}

	async generatePrefixedId(prefix: string): Promise<string> {
		const id = await this.generateShortId();
		return `${prefix}_${id}`;
	}
}
