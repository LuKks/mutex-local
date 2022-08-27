import test from 'brittle'
import mutexLocal from './index.js'
import { temporaryFile } from 'tempy'

test('basic', async function (t) {
  const filename = temporaryFile()

  const mutex = mutexLocal(filename)

  t.ok(await mutex.tryLock(), 'granted')
  t.absent(await mutex.tryLock(), 'denied')

  await mutex.unlock()

  const output = await Promise.all([mutex.tryLock(), mutex.tryLock()])
  t.alike(output, [true, false], '[granted, denied]')

  await mutex.unlock()
})

test('basic', async function (t) {
  const filename = temporaryFile()

  const mutex1 = mutexLocal(filename)
  const mutex2 = mutexLocal(filename)

  t.ok(await mutex1.tryLock(), 'granted')
  t.absent(await mutex2.tryLock(), 'denied')

  await mutex1.unlock()

  const output = await Promise.all([mutex1.tryLock(), mutex2.tryLock()])
  t.unlike(output, [true, true], 'has to be [granted, denied] or [denied, granted]')
  t.unlike(output, [false, false], 'has to be [granted, denied] or [denied, granted]')

  if (output[0]) await mutex1.unlock()
  else if (output[1]) await mutex2.unlock()
})
