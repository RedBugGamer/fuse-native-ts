/// <reference types="node" />
const os = require('os')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const Nanoresource = require('nanoresource')
const { beforeMount, beforeUnmount, configure, unconfigure, isConfigured } = require('fuse-shared-library')

const binding = require('node-gyp-build')(__dirname)

const IS_OSX = os.platform() === 'darwin'
const OSX_FOLDER_ICON = '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericFolderIcon.icns'
const HAS_FOLDER_ICON = IS_OSX && fs.existsSync(OSX_FOLDER_ICON)
const DEFAULT_TIMEOUT = 15 * 1000
const TIMEOUT_ERRNO = IS_OSX ? -60 : -110
const ENOTCONN = IS_OSX ? -57 : -107

const OpcodesAndDefaults = new Map([
  ['init', {
    op: binding.op_init
  }],
  ['error', {
    op: binding.op_error
  }],
  ['access', {
    op: binding.op_access,
    defaults: [0]
  }],
  ['statfs', {
    op: binding.op_statfs,
    defaults: [getStatfsArray()]
  }],
  ['fgetattr', {
    op: binding.op_fgetattr,
    defaults: [getStatArray()]
  }],
  ['getattr', {
    op: binding.op_getattr,
    defaults: [getStatArray()]
  }],
  ['flush', {
    op: binding.op_flush
  }],
  ['fsync', {
    op: binding.op_fsync
  }],
  ['fsyncdir', {
    op: binding.op_fsyncdir
  }],
  ['readdir', {
    op: binding.op_readdir,
    defaults: [[], []]
  }],
  ['truncate', {
    op: binding.op_truncate
  }],
  ['ftruncate', {
    op: binding.op_ftruncate
  }],
  ['utimens', {
    op: binding.op_utimens
  }],
  ['readlink', {
    op: binding.op_readlink,
    defaults: ['']
  }],
  ['chown', {
    op: binding.op_chown
  }],
  ['chmod', {
    op: binding.op_chmod
  }],
  ['mknod', {
    op: binding.op_mknod
  }],
  ['setxattr', {
    op: binding.op_setxattr
  }],
  ['getxattr', {
    op: binding.op_getxattr
  }],
  ['listxattr', {
    op: binding.op_listxattr
  }],
  ['removexattr', {
    op: binding.op_removexattr
  }],
  ['open', {
    op: binding.op_open,
    defaults: [0]
  }],
  ['opendir', {
    op: binding.op_opendir,
    defaults: [0]
  }],
  ['read', {
    op: binding.op_read,
    defaults: [0]
  }],
  ['write', {
    op: binding.op_write,
    defaults: [0]
  }],
  ['release', {
    op: binding.op_release
  }],
  ['releasedir', {
    op: binding.op_releasedir
  }],
  ['create', {
    op: binding.op_create,
    defaults: [0]
  }],
  ['unlink', {
    op: binding.op_unlink
  }],
  ['rename', {
    op: binding.op_rename
  }],
  ['link', {
    op: binding.op_link
  }],
  ['symlink', {
    op: binding.op_symlink
  }],
  ['mkdir', {
    op: binding.op_mkdir
  }],
  ['rmdir', {
    op: binding.op_rmdir
  }]
])
type Cb = (code: number|null, value?: any) => undefined
type defaultArgs = Array<any>
export interface Ops {
  [name: string]: (...args: defaultArgs) => void
  init?: (cb: Cb) => void
  error?: (...args: defaultArgs) => void
  access?: (path: string, mode: any, cb: Cb) => void
  statfs?: (path: string, cb: Cb) => void
  fgetattr?: (path: string, fd: number, cb: Cb) => void
  getattr?: (path: string, cb: Cb) => void
  flush?: (path: string, fd: number, cb: Cb) => void
  fsync?: (path: string, fd: number, datasync: any, cb: Cb) => void
  fsyncdir?: (path: string, fd: number, datasync: any, cb: Cb) => void
  readdir?: (path: string, cb: Cb) => void
  truncate?: (path: string, size: number, cb: Cb) => void
  ftruncate?: (path: string, fd: number, size: number, cb: Cb) => void
  utimens?: (path: string, atime: number, mtime: number, cb: Cb) => void
  readlink?: (path: string, cb: Cb) => void
  chown?: (path: string, uid: number, gid: number, cb: Cb) => void
  chmod?: (path: string, mode: any, cb: Cb) => void
  mknod?: (path: string, mode: any, dev: any, cb: Cb) => void
  setxattr?: (path: string, name: string, value: Buffer, position: number, flags: number, cb: Cb) => void
  getxattr?: (path: string, name: string, position: number, cb: Cb) => void
  listxattr?: (path: string, cb: Cb) => void
  removexattr?: (path: string, name: string, cb: Cb) => void
  open?: (path: string, flags: number, cb: Cb) => void
  opendir?: (path: string, flags: number, cb: Cb) => void
  read?: (path: string, fd: number, buffer: Buffer, lenght: number, position: number, cb: Cb) => void
  write?: (path: string, fd: number, buffer: Buffer, length: number, position: number, cb: Cb) => void
  release?: (path: string, fd: number, cb: Cb) => void
  releasedir?: (path: string, fd: number, cb: Cb) => void
  create?: (path: string, mode: any, cb: Cb) => void
  unlink?: (path: string, cb: Cb) => void
  rename?: (src: string, dest: string, cb: Cb) => void
  link?: (src: string, dest: string, cb: Cb) => void
  symlink?: (src: string, dest: string, cb: Cb) => void
  mkdir?: (path: string, mode: any, cb: Cb) => void
  rmdir?: (path: string, cb: Cb) => void
}
export interface Opts {
  displayFolder?: string | boolean,
  debug?: boolean,
  force?: boolean,
  mkdir?: boolean,
  timeout?: boolean,
}
export default class Fuse extends Nanoresource {
  static EPERM: number = -1
  static beforeMount: any = beforeMount
  static beforeUnmount: any = beforeUnmount
  static configure: any = configure
  static unconfigure: any = unconfigure
  static isConfigured: any = isConfigured
  static ENOENT: number = -2
  static ESRCH: number = -3
  static EINTR: number = -4
  static EIO: number = -5
  static ENXIO: number = -6
  static E2BIG: number = -7
  static ENOEXEC: number = -8
  static EBADF: number = -9
  static ECHILD: number = -10
  static EAGAIN: number = -11
  static ENOMEM: number = -12
  static EACCES: number = -13
  static EFAULT: number = -14
  static ENOTBLK: number = -15
  static EBUSY: number = -16
  static EEXIST: number = -17
  static EXDEV: number = -18
  static ENODEV: number = -19
  static ENOTDIR: number = -20
  static EISDIR: number = -21
  static EINVAL: number = -22
  static ENFILE: number = -23
  static EMFILE: number = -24
  static ENOTTY: number = -25
  static ETXTBSY: number = -26
  static EFBIG: number = -27
  static ENOSPC: number = -28
  static ESPIPE: number = -29
  static EROFS: number = -30
  static EMLINK: number = -31
  static EPIPE: number = -32
  static EDOM: number = -33
  static ERANGE: number = -34
  static EDEADLK: number = -35
  static ENAMETOOLONG: number = -36
  static ENOLCK: number = -37
  static ENOSYS: number = -38
  static ENOTEMPTY: number = -39
  static ELOOP: number = -40
  static EWOULDBLOCK: number = -11
  static ENOMSG: number = -42
  static EIDRM: number = -43
  static ECHRNG: number = -44
  static EL2NSYNC: number = -45
  static EL3HLT: number = -46
  static EL3RST: number = -47
  static ELNRNG: number = -48
  static EUNATCH: number = -49
  static ENOCSI: number = -50
  static EL2HLT: number = -51
  static EBADE: number = -52
  static EBADR: number = -53
  static EXFULL: number = -54
  static ENOANO: number = -55
  static EBADRQC: number = -56
  static EBADSLT: number = -57
  static EDEADLOCK: number = -35
  static EBFONT: number = -59
  static ENOSTR: number = -60
  static ENODATA: number = -61
  static ETIME: number = -62
  static ENOSR: number = -63
  static ENONET: number = -64
  static ENOPKG: number = -65
  static EREMOTE: number = -66
  static ENOLINK: number = -67
  static EADV: number = -68
  static ESRMNT: number = -69
  static ECOMM: number = -70
  static EPROTO: number = -71
  static EMULTIHOP: number = -72
  static EDOTDOT: number = -73
  static EBADMSG: number = -74
  static EOVERFLOW: number = -75
  static ENOTUNIQ: number = -76
  static EBADFD: number = -77
  static EREMCHG: number = -78
  static ELIBACC: number = -79
  static ELIBBAD: number = -80
  static ELIBSCN: number = -81
  static ELIBMAX: number = -82
  static ELIBEXEC: number = -83
  static EILSEQ: number = -84
  static ERESTART: number = -85
  static ESTRPIPE: number = -86
  static EUSERS: number = -87
  static ENOTSOCK: number = -88
  static EDESTADDRREQ: number = -89
  static EMSGSIZE: number = -90
  static EPROTOTYPE: number = -91
  static ENOPROTOOPT: number = -92
  static EPROTONOSUPPORT: number = -93
  static ESOCKTNOSUPPORT: number = -94
  static EOPNOTSUPP: number = -95
  static EPFNOSUPPORT: number = -96
  static EAFNOSUPPORT: number = -97
  static EADDRINUSE: number = -98
  static EADDRNOTAVAIL: number = -99
  static ENETDOWN: number = -100
  static ENETUNREACH: number = -101
  static ENETRESET: number = -102
  static ECONNABORTED: number = -103
  static ECONNRESET: number = -104
  static ENOBUFS: number = -105
  static EISCONN: number = -106
  static ENOTCONN: number = -107
  static ESHUTDOWN: number = -108
  static ETOOMANYREFS: number = -109
  static ETIMEDOUT: number = -110
  static ECONNREFUSED: number = -111
  static EHOSTDOWN: number = -112
  static EHOSTUNREACH: number = -113
  static EALREADY: number = -114
  static EINPROGRESS: number = -115
  static ESTALE: number = -116
  static EUCLEAN: number = -117
  static ENOTNAM: number = -118
  static ENAVAIL: number = -119
  static EISNAM: number = -120
  static EREMOTEIO: number = -121
  static EDQUOT: number = -122
  static ENOMEDIUM: number = -123
  static EMEDIUMTYPE: number = -124

  constructor(mnt: string, ops: Ops, opts: Opts = {}) {
    super()

    this.opts = opts
    this.mnt = path.resolve(mnt)
    this.ops = ops
    this.timeout = opts.timeout === false ? 0 : (opts.timeout || DEFAULT_TIMEOUT)

    this._force = !!opts.force
    this._mkdir = !!opts.mkdir
    this._thread = null
    this._handlers = this._makeHandlerArray()
    this._threads = new Set()

    const implemented = [binding.op_init, binding.op_error, binding.op_getattr]
    if (ops) {
      for (const [name, { op }] of OpcodesAndDefaults) {
        if (ops[name]) implemented.push(op)
      }
    }
    this._implemented = new Set(implemented)

    // Used to determine if the user-defined callback needs to be nextTick'd.
    this._sync = true
  }

  _getImplementedArray() {
    const implemented = new Uint32Array(35)
    for (const impl of this._implemented) {
      implemented[impl] = 1
    }
    return implemented
  }

  _fuseOptions() {
    const options = []

    if ((/\*|(^,)fuse-bindings(,$)/.test(process.env?.DEBUG ? process.env?.DEBUG : "")) || this.opts.debug) options.push('debug')
    if (this.opts.allowOther) options.push('allow_other')
    if (this.opts.allowRoot) options.push('allow_root')
    if (this.opts.autoUnmount) options.push('auto_unmount')
    if (this.opts.defaultPermissions) options.push('default_permissions')
    if (this.opts.blkdev) options.push('blkdev')
    if (this.opts.blksize) options.push('blksize=' + this.opts.blksize)
    if (this.opts.maxRead) options.push('max_read=' + this.opts.maxRead)
    if (this.opts.fd) options.push('fd=' + this.opts.fd)
    if (this.opts.userId) options.push('user_id=', this.opts.userId)
    if (this.opts.fsname) options.push('fsname=' + this.opts.fsname)
    if (this.opts.subtype) options.push('subtype=' + this.opts.subtype)
    if (this.opts.kernelCache) options.push('kernel_cache')
    if (this.opts.autoCache) options.push('auto_cache')
    if (this.opts.umask) options.push('umask=' + this.opts.umask)
    if (this.opts.uid) options.push('uid=' + this.opts.uid)
    if (this.opts.gid) options.push('gid=' + this.opts.gid)
    if (this.opts.entryTimeout) options.push('entry_timeout=' + this.opts.entryTimeout)
    if (this.opts.attrTimeout) options.push('attr_timeout=' + this.opts.attrTimeout)
    if (this.opts.acAttrTimeout) options.push('ac_attr_timeout=' + this.opts.acAttrTimeout)
    if (this.opts.noforget) options.push('noforget')
    if (this.opts.remember) options.push('remember=' + this.opts.remember)
    if (this.opts.modules) options.push('modules=' + this.opts.modules)

    if (this.opts.displayFolder && IS_OSX) { // only works on osx
      options.push('volname=' + path.basename(this.opts.name || this.mnt))
      if (HAS_FOLDER_ICON) options.push('volicon=' + OSX_FOLDER_ICON)
    }

    return options.length ? '-o' + options.join(',') : ''
  }

  _malloc(size: number) {
    const buf = Buffer.alloc(size)
    this._threads.add(buf)
    return buf
  }

  _makeHandlerArray() {
    const self = this
    const handlers = new Array(OpcodesAndDefaults.size)

    for (const [name, { op, defaults }] of OpcodesAndDefaults) {
      const nativeSignal = binding[`fuse_native_signal_${name}`]
      if (!nativeSignal) continue

      handlers[op] = makeHandler(name, op, defaults, nativeSignal)
    }

    return handlers

    function makeHandler(name: string, op: any, defaults: any, nativeSignal: any) {
      let to = self.timeout
      if (typeof to === 'object' && to) {
        const defaultTimeout = to.default || DEFAULT_TIMEOUT
        to = to[name]
        if (!to && to !== false) to = defaultTimeout
      }

      return function (nativeHandler: any, opCode: any, ...args: defaultArgs) {
        const sig = signal.bind(null, nativeHandler)
        const input = [...args]
        const boundSignal = to ? autoTimeout(sig, input) : sig
        const funcName = `_op_${name}`
        if (!self[funcName] || !self._implemented.has(op)) return boundSignal(-1, ...defaults)
        return self[funcName].apply(self, [boundSignal, ...args])
      }

      function signal(nativeHandler: any, err: any, ...args: defaultArgs) {
        var arr = [nativeHandler, err, ...args]

        if (defaults) {
          while (arr.length > 2 && arr[arr.length - 1] === undefined) arr.pop()
          if (arr.length === 2) arr = arr.concat(defaults)
        }

        return process.nextTick(nativeSignal, ...arr)
      }

      function autoTimeout(cb: any, input: any) {
        let called = false
        const timeout = setTimeout(timeoutWrap, to, TIMEOUT_ERRNO)
        return timeoutWrap

        function timeoutWrap(err: any, ...args: defaultArgs) {
          if (called) return
          called = true

          clearTimeout(timeout)

          if (err === TIMEOUT_ERRNO) {
            switch (name) {
              case 'write':
              case 'read':
                return cb(TIMEOUT_ERRNO, 0, input[2].buffer)
              case 'setxattr':
                return cb(TIMEOUT_ERRNO, input[2].buffer)
              case 'getxattr':
                return cb(TIMEOUT_ERRNO, input[2].buffer)
              case 'listxattr':
                return cb(TIMEOUT_ERRNO, input[1].buffer)
            }
          }

          cb(err, ...args)
        }
      }
    }
  }

  // Static methods

  static unmount(mnt: string, cb: Cb) {
    mnt = JSON.stringify(mnt)
    const cmd = IS_OSX ? `diskutil unmount force ${mnt}` : `fusermount -uz ${mnt}`
    exec(cmd, (err: any) => {
      if (err) return cb(err)
      return cb(null)
    })
  }

  // Debugging methods

  // Lifecycle methods

  _open(cb: any) {
    const self = this

    if (this._force) {
      return fs.stat(path.join(this.mnt, 'test'), (err: any, st: any) => {
        if (err && (err.errno === ENOTCONN || err.errno === Fuse.ENXIO)) return Fuse.unmount(this.mnt, open)
        return open()
      })
    }
    return open()

    function open() {
      // If there was an unmount error, continue attempting to mount (this is the best we can do)
      self._thread = Buffer.alloc(binding.sizeof_fuse_thread_t)
      self._openCallback = cb

      const opts = self._fuseOptions()
      const implemented = self._getImplementedArray()

      return fs.stat(self.mnt, (err: any, stat: any) => {
        if (err && err.errno !== -2) return cb(err)
        if (err) {
          if (!self._mkdir) return cb(new Error('Mountpoint does not exist'))
          return fs.mkdir(self.mnt, { recursive: true }, (err: Error) => {
            if (err) return cb(err)
            fs.stat(self.mnt, (err: any, stat: any) => {
              if (err) return cb(err)
              return onexists(stat)
            })
          })
        }
        if (!stat.isDirectory()) return cb(new Error('Mountpoint is not a directory'))
        return onexists(stat)
      })

      function onexists(stat: any) {
        fs.stat(path.join(self.mnt, '..'), (_: any, parent: any) => {
          if (parent && parent.dev !== stat.dev) return cb(new Error('Mountpoint in use'))
          try {
            // TODO: asyncify
            binding.fuse_native_mount(self.mnt, opts, self._thread, self, self._malloc, self._handlers, implemented)
          } catch (err) {
            return cb(err)
          }
        })
      }
    }
  }

  _close(cb: any) {
    const self = this

    Fuse.unmount(this.mnt, (err: any) => {
      if (err) {
        err.unmountFailure = true
        return cb(err)
      }
      nativeUnmount()
    })

    function nativeUnmount() {
      try {
        binding.fuse_native_unmount(self.mnt, self._thread)
      } catch (err) {
        return cb(err)
      }
      return cb(null)
    }
  }

  // Handlers

  _op_init(signal: any) {
    if (this._openCallback) {
      process.nextTick(this._openCallback, null)
      this._openCallback = null
    }
    if (!this.ops.init) {
      signal(0)
      return
    }
    this.ops.init((err: any) => {
      return signal(err)
    })
  }

  _op_error(signal: any) {
    if (!this.ops.error) {
      signal(0)
      return
    }
    this.ops.error((err: any) => {
      return signal(err)
    })
  }

  _op_statfs(signal: any, path: any) {
    this.ops.statfs(path, (err: any, statfs: any) => {
      if (err) return signal(err)
      const arr = getStatfsArray(statfs)
      return signal(0, arr)
    })
  }

  _op_getattr(signal: any, path: any) {
    if (!this.ops.getattr) {
      if (path !== '/') {
        signal(Fuse.EPERM)
      } else {
        signal(0, getStatArray({ mtime: new Date(0), atime: new Date(0), ctime: new Date(0), mode: 16877, size: 4096 }))
      }
      return
    }

    this.ops.getattr(path, (err: any, stat: any) => {
      if (err) return signal(err, getStatArray())
      return signal(0, getStatArray(stat))
    })
  }

  _op_fgetattr(signal: any, path: any, fd: any) {
    if (!this.ops.fgetattr) {
      if (path !== '/') {
        signal(Fuse.EPERM)
      } else {
        signal(0, getStatArray({ mtime: new Date(0), atime: new Date(0), ctime: new Date(0), mode: 16877, size: 4096 }))
      }
      return
    }
    this.ops.getattr(path, (err: any, stat: any) => {
      if (err) return signal(err)
      return signal(0, getStatArray(stat))
    })
  }

  _op_access(signal: any, path: any, mode: any) {
    this.ops.access(path, mode, (err: any) => {
      return signal(err)
    })
  }

  _op_open(signal: any, path: any, flags: any) {
    this.ops.open(path, flags, (err: any, fd: any) => {
      return signal(err, fd)
    })
  }

  _op_opendir(signal: any, path: any, flags: any) {
    this.ops.opendir(path, flags, (err: any, fd: any) => {
      return signal(err, fd)
    })
  }

  _op_create(signal: any, path: any, mode: any) {
    this.ops.create(path, mode, (err: any, fd: any) => {
      return signal(err, fd)
    })
  }

  _op_utimens(signal: any, path: any, atimeLow: any, atimeHigh: any, mtimeLow: any, mtimeHigh: any) {
    const atime = getDoubleArg(atimeLow, atimeHigh)
    const mtime = getDoubleArg(mtimeLow, mtimeHigh)
    this.ops.utimens(path, atime, mtime, (err: any) => {
      return signal(err)
    })
  }

  _op_release(signal: any, path: any, fd: any) {
    this.ops.release(path, fd, (err: any) => {
      return signal(err)
    })
  }

  _op_releasedir(signal: any, path: any, fd: any) {
    this.ops.releasedir(path, fd, (err: any) => {
      return signal(err)
    })
  }

  _op_read(signal: any, path: any, fd: any, buf: any, len: any, offsetLow: any, offsetHigh: any) {
    this.ops.read(path, fd, buf, len, getDoubleArg(offsetLow, offsetHigh), (err: any, bytesRead: any) => {
      return signal(err, bytesRead || 0, buf.buffer)
    })
  }

  _op_write(signal: any, path: any, fd: any, buf: any, len: any, offsetLow: any, offsetHigh: any) {
    this.ops.write(path, fd, buf, len, getDoubleArg(offsetLow, offsetHigh), (err: any, bytesWritten: any) => {
      return signal(err, bytesWritten || 0, buf.buffer)
    })
  }

  _op_readdir(signal: any, path: any) {
    this.ops.readdir(path, (err: any, names: any, stats: any) => {
      if (err) return signal(err)
      if (stats) stats = stats.map(getStatArray)
      return signal(0, names, stats || [])
    })
  }

  _op_setxattr(signal: any, path: any, name: any, value: any, position: any, flags: any) {
    this.ops.setxattr(path, name, value, position, flags, (err: any) => {
      return signal(err, value.buffer)
    })
  }

  _op_getxattr(signal: any, path: any, name: any, valueBuf: any, position: any) {
    this.ops.getxattr(path, name, position, (err: any, value: any) => {
      if (!err) {
        if (!value) return signal(IS_OSX ? -93 : -61, valueBuf.buffer)
        value.copy(valueBuf)
        return signal(value.length, valueBuf.buffer)
      }
      return signal(err, valueBuf.buffer)
    })
  }

  _op_listxattr(signal: any, path: any, listBuf: any) {
    this.ops.listxattr(path, (err: any, list: any) => {
      if (list && !err) {
        if (!listBuf.length) {
          let size = 0
          for (const name of list) size += Buffer.byteLength(name) + 1
          size += 128 // fuse yells if we do not signal room for some mac stuff also
          return signal(size, listBuf.buffer)
        }

        let ptr = 0
        for (const name of list) {
          listBuf.write(name, ptr)
          ptr += Buffer.byteLength(name)
          listBuf[ptr++] = 0
        }

        return signal(ptr, listBuf.buffer)
      }
      return signal(err, listBuf.buffer)
    })
  }

  _op_removexattr(signal: any, path: any, name: any) {
    this.ops.removexattr(path, name, (err: any) => {
      return signal(err)
    })
  }

  _op_flush(signal: any, path: any, fd: any) {
    this.ops.flush(path, fd, (err: any) => {
      return signal(err)
    })
  }

  _op_fsync(signal: any, path: any, datasync: any, fd: any) {
    this.ops.fsync(path, datasync, fd, (err: any) => {
      return signal(err)
    })
  }

  _op_fsyncdir(signal: any, path: any, datasync: any, fd: any) {
    this.ops.fsyncdir(path, datasync, fd, (err: any) => {
      return signal(err)
    })
  }

  _op_truncate(signal: any, path: any, sizeLow: any, sizeHigh: any) {
    const size = getDoubleArg(sizeLow, sizeHigh)
    this.ops.truncate(path, size, (err: any) => {
      return signal(err)
    })
  }

  _op_ftruncate(signal: any, path: any, fd: any, sizeLow: any, sizeHigh: any) {
    const size = getDoubleArg(sizeLow, sizeHigh)
    this.ops.ftruncate(path, fd, size, (err: any) => {
      return signal(err)
    })
  }

  _op_readlink(signal: any, path: any) {
    this.ops.readlink(path, (err: any, linkname: any) => {
      return signal(err, linkname)
    })
  }

  _op_chown(signal: any, path: any, uid: any, gid: any) {
    this.ops.chown(path, uid, gid, (err: any) => {
      return signal(err)
    })
  }

  _op_chmod(signal: any, path: any, mode: any) {
    this.ops.chmod(path, mode, (err: any) => {
      return signal(err)
    })
  }

  _op_mknod(signal: any, path: string, mode: any, dev: any) {
    this.ops.mknod(path, mode, dev, (err: Error) => {
      return signal(err)
    })
  }

  _op_unlink(signal: any, path: string) {
    this.ops.unlink(path, (err: Error) => {
      return signal(err)
    })
  }

  _op_rename(signal: any, src: any, dest: any) {
    this.ops.rename(src, dest, (err: Error) => {
      return signal(err)
    })
  }

  _op_link(signal: any, src: any, dest: any) {
    this.ops.link(src, dest, (err: Error) => {
      return signal(err)
    })
  }

  _op_symlink(signal: any, src: any, dest: any) {
    this.ops.symlink(src, dest, (err: Error) => {
      return signal(err)
    })
  }

  _op_mkdir(signal: any, path: string, mode: any) {
    this.ops.mkdir(path, mode, (err: Error) => {
      return signal(err)
    })
  }

  _op_rmdir(signal: any, path: string) {
    this.ops.rmdir(path, (err: Error) => {
      return signal(err)
    })
  }

  // Public API

  mount(cb: any) {
    return this.open(cb)
  }

  unmount(cb: any) {
    return this.close(cb)
  }

  errno(code: any) {
    return (code && Fuse[code.toUpperCase()]) || -1
  }
}


// Forward configuration functions through the exported class.

export interface StatFs {
  bsize:number
  frsize:number
  blocks:number
  bfree:number
  bavail:number
  files:number
  ffree:number
  favail:number
  fsid:number
  flag:number
  namemax:number
}

export function getStatfsArray(statfs?: any) {
  const ints = new Uint32Array(11)

  ints[0] = (statfs && statfs.bsize) || 0
  ints[1] = (statfs && statfs.frsize) || 0
  ints[2] = (statfs && statfs.blocks) || 0
  ints[3] = (statfs && statfs.bfree) || 0
  ints[4] = (statfs && statfs.bavail) || 0
  ints[5] = (statfs && statfs.files) || 0
  ints[6] = (statfs && statfs.ffree) || 0
  ints[7] = (statfs && statfs.favail) || 0
  ints[8] = (statfs && statfs.fsid) || 0
  ints[9] = (statfs && statfs.flag) || 0
  ints[10] = (statfs && statfs.namemax) || 0

  return ints
}

function setDoubleInt(arr: any, idx: any, num: any) {
  arr[idx] = num % 4294967296
  arr[idx + 1] = (num - arr[idx]) / 4294967296
}

function getDoubleArg(a: any, b: any) {
  return a + b * 4294967296
}

export function toDateMS(st?: number|Date) {
  if (typeof st === 'number') return st
  if (!st) return Date.now()
  return st.getTime()
}
export interface Stat {
  mode?:number,
  uid?:number,
  gid?:number,
  size?:number,
  dev?:number,
  nlink?:number,
  ino?:number,
  rdev?:number,
  blksize?:number,
  blocks?:number,
  atime?:Date,
  mtime?:Date,
  ctime?:Date,
}
export function getStatArray(stat?: Stat) {
  const ints = new Uint32Array(18)

  ints[0] = (stat && stat.mode) || 0
  ints[1] = (stat && stat.uid) || 0
  ints[2] = (stat && stat.gid) || 0
  setDoubleInt(ints, 3, (stat && stat.size) || 0)
  ints[5] = (stat && stat.dev) || 0
  ints[6] = (stat && stat.nlink) || 1
  ints[7] = (stat && stat.ino) || 0
  ints[8] = (stat && stat.rdev) || 0
  ints[9] = (stat && stat.blksize) || 0
  setDoubleInt(ints, 10, (stat && stat.blocks) || 0)
  setDoubleInt(ints, 12, toDateMS(stat && stat.atime))
  setDoubleInt(ints, 14, toDateMS(stat && stat.mtime))
  setDoubleInt(ints, 16, toDateMS(stat && stat.ctime))

  return ints
}
