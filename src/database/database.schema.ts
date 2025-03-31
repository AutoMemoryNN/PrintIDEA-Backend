import {
	index,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';

export enum UserRoles {
	ADMIN = 'admin',
	CLIENT = 'client',
}
export enum OrgRoles {
	ADMIN = 'admin',
	MEMBER = 'member',
}

export enum TaskStatus {
	PENDING = 'pending',
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled',
}

export enum TaskPriorities {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	URGENT = 'urgent',
}

function enumToPgEnum<T extends Record<string, string>>(
	tsEnum: T,
): [T[keyof T], ...T[keyof T][]] {
	return Object.values(tsEnum) as [T[keyof T], ...T[keyof T][]];
}

export const userRoleEnum = pgEnum('user_role', enumToPgEnum(UserRoles));
export const orgRoleEnum = pgEnum('org_role', enumToPgEnum(OrgRoles));
export const taskStatusEnum = pgEnum('task_status', enumToPgEnum(TaskStatus));
export const taskPriorityEnum = pgEnum(
	'task_priority',
	enumToPgEnum(TaskPriorities),
);

export const users = pgTable('users', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	alias: varchar('alias', { length: 100 }).notNull(),
	email: varchar('email', { length: 100 }).notNull().unique(),
	role: userRoleEnum('role').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	userOrganizations: many(userOrganization),
}));

export const organizations = pgTable('organizations', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	description: text('description').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	leaderId: varchar('leader_id', { length: 36 })
		.notNull()
		.references(() => users.id),
});

export const organizationsRelations = relations(
	organizations,
	({ one, many }) => ({
		leader: one(users, {
			fields: [organizations.leaderId],
			references: [users.id],
		}),
		userOrganizations: many(userOrganization),
		projects: many(projects),
	}),
);

export const userOrganization = pgTable(
	'users_organizations',
	{
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => users.id),
		organizationId: varchar('organization_id', { length: 36 })
			.notNull()
			.references(() => organizations.id),
		role: orgRoleEnum('role').notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.organizationId] }),
		index('idx_user_organization_user').on(table.userId),
		index('idx_user_organization_org').on(table.organizationId),
	],
);

export const userOrganizationRelations = relations(
	userOrganization,
	({ one }) => ({
		user: one(users, {
			fields: [userOrganization.userId],
			references: [users.id],
		}),
		organization: one(organizations, {
			fields: [userOrganization.organizationId],
			references: [organizations.id],
		}),
	}),
);

export const projects = pgTable('projects', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	description: text('description').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	organizationId: varchar('organization_id', { length: 36 })
		.notNull()
		.references(() => organizations.id),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [projects.organizationId],
		references: [organizations.id],
	}),
	tasks: many(tasks),
}));

export const tasks = pgTable('tasks', {
	id: varchar('id', { length: 36 }).primaryKey(),
	title: varchar('title', { length: 100 }).notNull(),
	description: text('description').notNull(),
	tag: varchar('tag', { length: 50 }),
	priority: taskPriorityEnum('priority'),
	initDate: timestamp('init_date').notNull(),
	endDate: timestamp('end_date').notNull(),
	status: taskStatusEnum('status').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	projectId: varchar('project_id', { length: 36 })
		.notNull()
		.references(() => projects.id),
});

const tasksRelations = relations(tasks, ({ one }) => ({
	project: one(projects, {
		fields: [tasks.projectId],
		references: [projects.id],
	}),
}));

export const Schema = {
	users,
	usersRelations,
	organizations,
	organizationsRelations,
	userOrganization,
	userOrganizationRelations,
	projects,
	projectsRelations,
	tasks,
	tasksRelations,
} as const;
