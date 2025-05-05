import {
	bigint,
	boolean,
	check,
	index,
	jsonb,
	numeric,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';

import { relations, sql } from 'drizzle-orm';

export enum UserRoles {
	ADMIN = 'admin',
	CLIENT = 'client',
}
export enum OrgRoles {
	ADMIN = 'admin',
	MEMBER = 'member',
	LEADER = 'leader',
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

export enum ShapesTypes {
	RECTANGLE = 'rectangle',
	CIRCLE = 'circle',
	LINE = 'line',
	ARROW = 'arrow',
	SCRIBBLE = 'scribble',
	TEXT = 'text',
	NOTE = 'note',
}

function enumToPgEnum<T extends Record<string, string>>(
	tsEnum: T,
): [T[keyof T], ...T[keyof T][]] {
	return Object.values(tsEnum) as [T[keyof T], ...T[keyof T][]];
}

export const userRoleEnum = pgEnum('user_roles_enum', enumToPgEnum(UserRoles));
export const orgRoleEnum = pgEnum('org_roles_enum', enumToPgEnum(OrgRoles));
export const taskStatusEnum = pgEnum(
	'task_status_enum',
	enumToPgEnum(TaskStatus),
);
export const taskPrioritiesEnum = pgEnum(
	'task_priorities',
	enumToPgEnum(TaskPriorities),
);
export const shapesTypesEnum = pgEnum(
	'shapes_types_enum',
	enumToPgEnum(ShapesTypes),
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
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
	userOrganizations: many(userOrganization),
	projects: many(projects),
}));

export const userOrganization = pgTable(
	'users_organizations',
	{
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => users.id),
		organizationId: varchar('organization_id', { length: 36 })
			.notNull()
			.references(() => organizations.id, { onDelete: 'cascade' }),
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
	status: taskStatusEnum('status').default(TaskStatus.PENDING).notNull(),
	startDate: timestamp('start_date'),
	endDate: timestamp('end_date'),
	priority: taskPrioritiesEnum('priority')
		.default(TaskPriorities.LOW)
		.notNull(),
	organizationId: varchar('organization_id', { length: 36 })
		.references(() => organizations.id, { onDelete: 'cascade' })
		.notNull(),
	boardId: varchar('board_id', { length: 36 })
		.unique()
		.references(() => boards.id, { onDelete: 'cascade' }),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [projects.organizationId],
		references: [organizations.id],
	}),
	tasks: many(tasks),
	board: one(boards, {
		fields: [projects.boardId],
		references: [boards.id],
	}),
}));

export const tasks = pgTable('tasks', {
	id: varchar('id', { length: 36 }).primaryKey(),
	title: varchar('title', { length: 100 }).notNull(),
	description: text('description').notNull(),
	tag: varchar('tag', { length: 50 }),
	priority: taskPrioritiesEnum('priority'),
	initDate: timestamp('init_date').notNull(),
	endDate: timestamp('end_date').notNull(),
	status: taskStatusEnum('status').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	projectId: varchar('project_id', { length: 36 })
		.notNull()
		.references(() => projects.id),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
	project: one(projects, {
		fields: [tasks.projectId],
		references: [projects.id],
	}),
}));

export const boards = pgTable('boards', {
	id: varchar('id', { length: 36 }).primaryKey(),
	width: numeric('width', { mode: 'number' }).notNull(),
	height: numeric('height', { mode: 'number' }).notNull(),
	baseVersion: bigint('base_version', { mode: 'number' }).notNull(),
});

export const boardsRelations = relations(boards, ({ one }) => ({
	project: one(projects, {
		fields: [boards.id],
		references: [projects.boardId],
	}),
}));

export const shapes = pgTable(
	'shapes',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		boardId: varchar('board_id', { length: 36 }).notNull(),
		type: shapesTypesEnum('type').notNull(),
		fillColor: text('fill_color').notNull(),
		strokeColor: text('stroke_color').notNull(),
		strokeWidth: numeric('stroke_width').notNull(),
		draggable: boolean('draggable').notNull(),
		shapeData: jsonb('shape_data').notNull(),
	},
	(table) => [
		check(
			'chk_shape_data',
			sql`(
		(type = 'rectangle' AND shape_data ?& array['x','y','width','height'])
	 OR (type = 'circle'    AND shape_data ?& array['x','y','radius'])
	 OR (type IN ('line','arrow','scribble') AND shape_data ? 'points')
	 OR (type = 'text'      AND shape_data ?& array['x','y','text','fontSize','width','padding'])
	 OR (type = 'note'      AND shape_data ?& array['x','y','width','height','padding','text'])
	  )`,
		),
		index('idx_shapes_board_type').on(table.boardId, table.type),
	],
);

export const shapesRelations = relations(shapes, ({ one }) => ({
	board: one(boards, {
		fields: [shapes.boardId],
		references: [boards.id],
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
	boards,
	boardsRelations,
	shapes,
} as const;
