import { test } from 'uvu';
import * as assert from 'uvu/assert';
import * as watchlist from '../src';

test('exports', () => {
	assert.type(watchlist, 'object');
	assert.type(watchlist.watch, 'function');
});

test.run();
