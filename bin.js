#!/usr/bin/env node
const mri = require('mri');

let i=0, command='';
const argv = process.argv.slice(2);
for (; i < argv.length; i++) {
	if (argv[i] === '--') {
		command = argv.splice(++i).join(' ');
		argv.pop();
		break;
	}
}

const opts = mri(argv, {
	default: {
		cwd: '.',
		clear: true,
		e: false,
	},
	alias: {
		cwd: 'C',
		eager: 'e',
		version: 'v',
		ignore: 'i',
		help: 'h',
	}
});

if (opts.version) {
	const { version } = require('./package.json');
	console.log(`watchlist, ${version}`);
	process.exit(0);
}

if (opts.help) {
	let msg = '';
	msg += '\n  Usage\n    $ watchlist [...directory] [options] -- <command>\n';
	msg += '\n  Options';
	msg += `\n    -C, --cwd       Directory to resolve from  (default .)`;
	msg += `\n    -e, --eager     Execute the command on startup`;
	msg += `\n    -i, --ignore    Any file patterns to ignore`;
	msg += '\n    -v, --version   Displays current version';
	msg += '\n    -h, --help      Displays this message\n';
	msg += '\n  Examples';
	msg += '\n    $ watchlist src -- npm run build';
	msg += '\n    $ watchlist src tests -i fixtures -- uvu -r esm tests\n';
	console.log(msg);
	process.exit(0);
}

if (!command.length) {
	console.error('Missing a command to execute!');
	process.exit(1);
}

const { run, watch } = require('./dist');

try {
	const handler = run.bind(0, command);
	const dirs = opts._ || [opts.cwd];
	watch(dirs, handler, opts);
} catch (err) {
	console.log('Oops~!', err);
}
