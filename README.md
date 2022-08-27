# mutex-local

Mutex lock for multi-process synchronization (i.e. multi-writing).

```
npm i mutex-local
```

## Usage
```javascript
const mutexLocal = require('mutex-local')

const mutex = mutexLocal('./filename.lock')

await mutex.waitForLock()
console.log('here do a synced operation between multiple process')
await mutex.unlock()
```

```javascript
const granted = await mutex.tryLock()
if (granted) {
  console.log('here do a synced operation between multiple process')
  await mutex.unlock()
}
```

If you exit the process with a locked mutex then it's automatically released.\
Still do `unlock()` when you can, to avoid file descriptor leaks.

## API

#### `const mutex = mutexLocal(filename)`

Creates a mutex lock based on a filename, so multiple process can coordinate.

#### `await mutex.waitForLock([options])`

Default options:
```js
{
  flags: 'a+',
  mode: 0o666,
  exclusive: true
}
```

#### `const granted = await mutex.tryLock([options])`

Options are the same as for `waitForLock([options])`.

#### `mutex.locked`

Boolean that indicates if mutex is locked or not.

## License
MIT
