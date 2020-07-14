import { promisify } from 'util';
import { resolve, join } from 'path';
import { existsSync, readdir, stat, watch as fsw } from 'fs';
import { exec } from 'child_process';

const run = promisify(exec);
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
		output[dir] = fsw(dir, { recursive: true }, onChange);
	} catch (err) {
		if (err.name !== 'ERR_FEATURE_UNAVAILABLE_ON_PLATFORM') throw err;
		output[dir] = fsw(dir, onChange);
		await walk(dir, (rel, abs) => {
			output[abs] = fsw(abs, onChange);
		});
	}

	return output;
}

export async function watch(list, command, opts={}) {
	const cwd = resolve('.', opts.cwd);
	const dirs = new Set(list.map(str => join(cwd, str)).filter(existsSync));
	const ignores = ['node_modules'].concat(opts.ignore || []).map(x => new RegExp(x, 'i'));

	let wip = 0;
	const Triggers = new Set;
	const Watchers = new Map;

	async function handle() {
		let pid = await run(command);
		if (pid.stdout) process.stdout.write(pid.stdout);
		if (pid.stderr) process.stderr.write(pid.stderr);
		if (--wip) return handle();
	}

	// TODO: Catch `EPERM` on Windows for removed dir
	// TODO: `filename` existence still conditional?
	async function onChange(dir, type, filename) {
		if (ignores.some(x => x.test(filename))) return;

		let tmp = join(dir, filename);
		if (Triggers.has(tmp) || !existsSync(tmp)) return;
		if (wip++) return wip = 2;

		let stats = await toStats(tmp);
		if (stats.isDirectory()) return;

		Triggers.add(tmp);
		console.clear();
		await handle();
		Triggers.delete(tmp);
	}

	let dir, output, key;
	for (dir of dirs) {
		output = await setup(dir, onChange.bind(0, dir));
		for (key in output) Watchers.set(key, output[key]);
	}
}
