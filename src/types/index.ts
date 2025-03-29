export type UserSession = {
	id: string;
	email: string;
	role: string;
	username: string;
	alias: string;
};

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
