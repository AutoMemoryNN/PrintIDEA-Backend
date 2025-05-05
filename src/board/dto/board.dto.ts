import { ShapeDto } from './shape.dto';

export class BoardStateDto {
	id: string;
	width: number;
	height: number;
	baseVersion: number;
	shapes: ShapeDto[];
}
