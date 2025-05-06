export interface RectangleData {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface CircleData {
	x: number;
	y: number;
	radius: number;
}

export interface LineData {
	points: number[];
}

export interface TextData {
	x: number;
	y: number;
	text: string;
	fontSize: number;
	width: number;
	padding: number;
}

export interface NoteData {
	x: number;
	y: number;
	width: number;
	height: number;
	padding: number;
	text: string;
	fontSize: number;
}

export interface ShapeDataMap {
	rectangle: RectangleData;
	circle: CircleData;
	line: LineData;
	arrow: LineData;
	scribble: LineData;
	text: TextData;
	note: NoteData;
}

export interface Board {
	id: string;
	width: number;
	height: number;
	baseVersion: number;
	shapes: Shape[];
}

export class Shape<T extends keyof ShapeDataMap = keyof ShapeDataMap> {
	id: string;
	type: T;
	fillColor: string;
	strokeColor: string;
	strokeWidth: number;
	draggable: boolean;

	shapeData: ShapeDataMap[T];
}

export enum DeltaOperations {
	ADD = 'ADD',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
}

export interface DeltaOperation {
	type: DeltaOperations;
	shape: Shape;
	version: number;
}
