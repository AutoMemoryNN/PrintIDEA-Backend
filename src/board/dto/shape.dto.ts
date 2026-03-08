import { ShapeDataMap } from '../board.types';

type ShapeBase<T extends keyof ShapeDataMap> = {
	id: string;
	type: T;
	fillColor: string;
	strokeColor: string;
	strokeWidth: number;
	draggable: boolean;
	shapeData: ShapeDataMap[T];
};

export type ShapeDto = {
	[K in keyof ShapeDataMap]: ShapeBase<K> extends infer O
		? Omit<O, 'shapeData'> & ShapeDataMap[K]
		: never;
}[keyof ShapeDataMap];
