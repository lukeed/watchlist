type Arrayable<T> = T[] | T;

export interface Options {
	cwd: string;
	ignore: Arrayable<RegExp | string>;
}

export function watch(dirs: string[], command: string, opts?: Partial<Options>): Promise<void>;
