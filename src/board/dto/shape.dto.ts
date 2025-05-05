import { ShapeDataMap } from '@board/board.types';

export class ShapeDto<T extends keyof ShapeDataMap = keyof ShapeDataMap> {
	id: string;
	type: T;
	fillColor: string;
	strokeColor: string;
	strokeWidth: number;
	draggable: boolean;

	shapeData: ShapeDataMap[T];
}
