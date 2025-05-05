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
	text: TextData;
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
