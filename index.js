const fs = require('fs/promises')
const path = require('path')
const fsne = require('fs-native-extensions')
const mutexify = require('mutexify/promise')

module.exports = function mutexLocal (filename) {
  return new MutexLocal(filename)
}

class MutexLocal {
  constructor (filename) {
    this.filename = path.resolve(filename)
    this.file = null

    this.lock = mutexify()
    this.release = null
  }

  get locked () {
    return this.lock.locked
  }

  async waitForLock ({ flags = 'a+', mode = 0o666, exclusive = true } = {}) {
    this.release = await this.lock()

    this.file = await fs.open(this.filename, flags, mode)

    await fsne.waitForLock(this.file.fd, { exclusive })
  }

  async tryLock ({ flags = 'a+', mode = 0o666, exclusive = true } = {}) {
    if (this.lock.locked) return false

    this.release = await this.lock()

    this.file = await fs.open(this.filename, flags, mode)

    const granted = fsne.tryLock(this.file.fd, { exclusive })
    if (!granted) {
      await this.unlock({ _notGranted: true })
      return false
    }

    return true
  }

  async unlock (opts = {}) {
    if (!this.lock.locked) return

    if (!this.file) {
      throw new Error('unlock() is being called twice (while still locked or locking)')
    }

    const file = this.file
    this.file = null

    if (!opts._notGranted) {
      fsne.unlock(file.fd)
    }

    await file.close()

    this.release()
  }
}
