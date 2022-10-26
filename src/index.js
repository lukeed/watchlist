import { promisify } from 'util';
import { resolve, join } from 'path';
import { existsSync, readdir, stat, watch as fsw } from 'fs';
import { exec } from 'child_process';

const toExec = promisify(exec);
const toStats = promisify(stat);
const toRead = promisify(readdir);

// modified: lukeed/totalist
async function walk(dir, callback, pre='') {
	await toRead(dir).then(arr => {
		return Promise.all(
			arr.map(str => {
				let abs = join(dir, str);
				return toStats(abs).then(stats => {
					if (!stats.isDirectory()) return;
					callback(join(pre, str), abs, stats);
					return walk(abs, callback, join(pre, str));
				});
			})
		);
	});
}

async function setup(dir, onChange) {
	let output = {};

	try {
		output[dir] = fsw(dir, { recursive: true }, onChange.bind(0, dir));
	} catch (err) {
		if (err.code !== 'ERR_FEATURE_UNAVAILABLE_ON_PLATFORM') throw err;
		output[dir] = fsw(dir, onChange.bind(0, dir));
		await walk(dir, (rel, abs) => {
			output[abs] = fsw(abs, onChange.bind(0, abs));
		});
	}

	return output;
}

export async function watch(list, callback, opts={}) {
	const cwd = resolve('.', opts.cwd || '.');
	const dirs = new Set(list.map(str => resolve(cwd, str)).filter(existsSync));
	const ignores = ['node_modules'].concat(opts.ignore || []).map(x => new RegExp(x, 'i'));

	let wip = 0;
	const Triggers = new Set;
	const Watchers = new Map;

	async function handle() {
		await callback();
		if (--wip) return handle();
	}

	// TODO: Catch `EPERM` on Windows for removed dir
	async function onChange(dir, type, filename) {
		if (filename === null) return;
		if (ignores.some(x => x.test(filename))) return;

		let tmp = join(dir, filename);
		if (Triggers.has(tmp)) return;
		if (wip++) return wip = 1;

		if (opts.clear) console.clear();

		Triggers.add(tmp);
		await handle();
		Triggers.delete(tmp);
	}

	let dir, output, key;
	for (dir of dirs) {
		output = await setup(dir, onChange);
		for (key in output) Watchers.set(key, output[key]);
	}

	if (opts.eager) {
		await callback();
	}
}

export async function run() {
	try {
		let pid = await toExec.apply(0, arguments);
		if (pid.stdout) process.stdout.write(pid.stdout);
		if (pid.stderr) process.stderr.write(pid.stderr);
	} catch (err) {
		console.log(`[ERROR] ${err.message}`); // TODO: beep?
		if (err.stdout) process.stdout.write(err.stdout);
		if (err.stderr) process.stderr.write(err.stderr);
	}
}
