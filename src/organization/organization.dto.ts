export type CreateOrgDto = {
	name: string;
	description: string;
};
export type UpdateOrgDto = {
	name?: string;
	description?: string;
};

export type OrgPartialInfo = {
	id?: string;
	name?: string;
	description?: string;
};

export type OrgInfo = {
	id: string;
	name: string;
	description: string;
};

export type AddUserDto = {
	mail: string;
	role: string;
};
