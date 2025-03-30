import {
	index,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';

export enum UserRole {
	ADMIN = 'admin',
	CLIENT = 'client',
}
export enum OrgRole {
	ADMIN = 'admin',
	MEMBER = 'member',
}

const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	email: varchar('email', { length: 100 }).notNull().unique(),
	privateKey: text('private_key').notNull(),
	role: varchar('role', { length: 50 }).notNull(),
});

const usersRelations = relations(users, ({ many }) => ({
	userOrganizations: many(userOrganization),
}));

const organizations = pgTable('organizations', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	description: text('description').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	leaderId: integer('leader_id')
		.notNull()
		.references(() => users.id),
});

const organizationsRelations = relations(organizations, ({ one, many }) => ({
	leader: one(users, {
		fields: [organizations.leaderId],
		references: [users.id],
	}),
	userOrganizations: many(userOrganization),
	projects: many(projects),
}));

const userOrganization = pgTable(
	'users_organizations',
	{
		userId: integer('user_id')
			.notNull()
			.references(() => users.id),
		organizationId: integer('organization_id')
			.notNull()
			.references(() => organizations.id),
		role: varchar('role', { length: 50 }).notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.organizationId] }),
		index('idx_user_organization_user').on(table.userId),
		index('idx_user_organization_org').on(table.organizationId),
	],
);

const userOrganizationRelations = relations(userOrganization, ({ one }) => ({
	user: one(users, {
		fields: [userOrganization.userId],
		references: [users.id],
	}),
	organization: one(organizations, {
		fields: [userOrganization.organizationId],
		references: [organizations.id],
	}),
}));

const projects = pgTable('projects', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	description: text('description').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	organizationId: integer('organization_id')
		.notNull()
		.references(() => organizations.id),
});

const projectsRelations = relations(projects, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [projects.organizationId],
		references: [organizations.id],
	}),
	tasks: many(tasks),
}));

const tasks = pgTable('tasks', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 100 }).notNull(),
	description: text('description').notNull(),
	tag: varchar('tag', { length: 50 }),
	priority: varchar('priority', { length: 50 }),
	initDate: timestamp('init_date').notNull(),
	endDate: timestamp('end_date').notNull(),
	status: varchar('status', { length: 50 }).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	projectId: integer('project_id')
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
