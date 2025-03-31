import {
	OrgRole,
	Schema,
	TaskPriority,
	TaskStatus,
	UserRole,
} from '@database/database.schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

/**
 * Represents a successful response from an controller
 *
 * @template T - The type of the data in the response. Defaults to `null`.
 *
 * If `T` is `null`, the response will contain only a message.
 * If `T` is not `null`, the response will contain both data and an optional message.
 *
 * @example
 * // Example with data
 * const response: SuccessResponse<{ id: number }> = {
 *   data: { id: 1 },
 *   message: "Operation successful"
 * };
 *
 * @example
 * // Example without data
 * const response: SuccessResponse = {
 *   message: "Operation successful"
 * };
 */
export type ControllerResponse<T = null> = T extends null
	? { message: string }
	: { data: T; message?: string };

export type UserDatabase = typeof Schema.users.$inferSelect;

export type OrganizationDatabase = typeof Schema.organizations.$inferSelect;

export type UserOrganizationDatabase =
	typeof Schema.userOrganization.$inferSelect;

export type ProjectDatabase = typeof Schema.projects.$inferSelect;

export type TaskDatabase = typeof Schema.tasks.$inferSelect;

export type MainDatabase = PostgresJsDatabase<typeof Schema>;

export { UserRole, OrgRole, TaskStatus, TaskPriority };
