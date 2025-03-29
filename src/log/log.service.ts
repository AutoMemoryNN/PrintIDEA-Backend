import { exit } from 'node:process';
import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LogService extends ConsoleLogger {
	log(message: string, context?: string, ...optionalParams: unknown[]): void {
		super.log(message, context || this.context, ...optionalParams);
	}

	warn(
		message: string,
		context?: string,
		...optionalParams: unknown[]
	): void {
		super.warn(message, context || this.context, ...optionalParams);
	}

	error(
		message: string,
		context?: string,
		...optionalParams: unknown[]
	): void {
		super.error(message, context || this.context, ...optionalParams);
	}

	fatal(
		message: string,
		context?: string,
		...optionalParams: unknown[]
	): void {
		super.error(
			`[FATAL] !!! ${message}`,
			context || this.context,
			...optionalParams,
		);
		exit(0);
	}
}
