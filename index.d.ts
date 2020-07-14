export interface Options {
	cwd: string;
	ignore: Array<RegExp | string>;
}

export function watch(dirs: string[], command: string, opts?: Partial<Options>): Promise<void>;
