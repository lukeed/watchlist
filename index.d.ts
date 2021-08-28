import type { BaseEncodingOptions } from 'fs';
import type { ExecOptions } from 'child_process';

type Arrayable<T> = T[] | T;
type Promisable<T> = Promise<T> | T;

export interface Options {
	cwd: string;
	clear: boolean;
	ignore: Arrayable<RegExp | string>;
	eager: boolean;
}

export type Handler = () => Promisable<any>;

export function watch(dirs: string[], handler: Handler, opts?: Partial<Options>): Promise<void>;

export function run(command: string, options: { encoding: 'buffer' | null } & ExecOptions): Promise<void>;
export function run(command: string, options: { encoding: BufferEncoding } & ExecOptions): Promise<void>;
export function run(command: string, options: { encoding: BufferEncoding } & ExecOptions): Promise<void>;
export function run(command: string, options: ExecOptions): Promise<void>;
export function run(command: string, options: (BaseEncodingOptions & ExecOptions) | undefined | null): Promise<void>;
