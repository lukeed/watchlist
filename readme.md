<div align="center">
  <img src="logo.jpg" alt="watchlist" width="400" />
</div>

<div align="center">
  <a href="https://npmjs.org/package/watchlist">
    <img src="https://badgen.now.sh/npm/v/watchlist" alt="version" />
  </a>
  <a href="https://github.com/lukeed/watchlist/actions">
    <img src="https://github.com/lukeed/watchlist/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://npmjs.org/package/watchlist">
    <img src="https://badgen.now.sh/npm/dm/watchlist" alt="downloads" />
  </a>
  <a href="https://packagephobia.now.sh/result?p=watchlist">
    <img src="https://packagephobia.now.sh/badge?p=watchlist" alt="install size" />
  </a>
</div>

<div align="center">
  Recursively <b>watch</b> a <b>list</b> of directories & run a command on any file system changes
</div>


## Features

* Extremely lightweight
* Simple [`fs.watch`](https://nodejs.org/api/fs.html#fs_fs_watch_filename_options_listener) wrapper<sup>†</sup>
* Runs on macOS, Linux, and Windows
* Recursively monitors all subdirectories
* Optional ignore patterns

> <sup>†</sup> While `fs.watch` has its inconsistencies, efforts are made to normalize behavior across platforms.


## Install

```
$ npm install --save-dev watchlist
```


## Usage

***CLI***

```sh
# Run `npm test` on changes within "src" and "test" contents change
$ watchlist src test -- npm test

# Run `npm test` on changes within "packages", ignoring /fixtures/i
$ watchlist packages --ignore fixtures -- npm test

# Run `lint` script on ANY change
$ watchlist -- npm run lint
```

***API***

```js
import { watch } from 'watchlist';

async function task() {
  console.log('~> something updated!');
  await execute_example(); // linter, tests, build, etc
}

// Run `task()` when "{src,test}/**/*" changes
// Must also ignore changes to any `/fixture/i` match
await watch(['src', 'test'], task, {
  ignore: 'fixtures'
});
```


## CLI

The `watchlist` binary expects the following usage:

```sh
$ watchlist [...directory] [options] -- <command>
```

> **Important:** The `--` is required! It separates your `command` from your `watchlist` arguments.

Please run `watchlist --help` for additional information.


## API

### watch(dirs: string[], handler: Function, options?: Options)
Returns: `Promise<void>`

Watch a list of directories recursively, calling `handler` whenever their contents are modified.

#### dirs
Type: `Array<String>`

The list of directories to watch.

May be relative or absolute paths. <br>All paths are resolved from the `opts.cwd` location.

#### handler
Type: `Function`

The callback function to run.

> **Note:** This may be a Promise/`async` function. Return values are ignored.

#### options.cwd
Type: `String`<br>
Default: `.`

The current working directory. All paths are resolved from this location. <br>Defaults to `process.cwd()`.

#### options.ignore
Type: `String` or `RegExp` or `Array<String | RegExp>`

A list of patterns that should **not** be watched nor should trigger a `handler` execution. <br>Ignore patterns are applied to file and directory paths alike.

> **Note:** Any `String` values will be converted into a `RegExp` automatically.

#### options.clear
Type: `Boolean`<br>
Default: `false`

Whether or not the `console` should be cleared before re-running your `handler` function.

> **Note:** Defaults to `true` for the CLI! Pass `--no-clear` to disable.

#### options.eager
Type: `Boolean`<br>
Default: `false`

When enabled, runs the `command` one time, after `watchlist` has initialized. When disabled, a change within the `dirs` list must be observed before the first `command` execution.


### run(command: string, ...args)
Returns: `Promise<void>`

All arguments to `watchlist.run` are passed to [`child_process.exec`][child_exec] directly.

> **Note:** Any `stdout` or `stderr` content will be piped/forwarded to your console.

#### command
Type: `String`

The command string to execute. <br>View [`child_process.exec`][child_exec] for more information.

#### args
Type: `String`

Additional [`child_process.exec`][child_exec] arguments.

> **Important:** The `callback` argument is not available!


## License

MIT © [Luke Edwards](https://lukeed.com)

[child_exec]: https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
