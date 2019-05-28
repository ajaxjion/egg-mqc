# egg-mqc

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-mqc.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-mqc
[travis-image]: https://img.shields.io/travis/eggjs/egg-mqc.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-mqc
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-mqc.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-mqc?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-mqc.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-mqc
[snyk-image]: https://snyk.io/test/npm/egg-mqc/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-mqc
[download-image]: https://img.shields.io/npm/dm/egg-mqc.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-mqc

<!--
Description here.
-->

## Install

```bash
$ npm i egg-mqc --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.mqc = {
  enable: true,
  package: 'egg-mqc',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.amqp = {
  protocol: 'amqp',
  hostname: 'localhost',
  port: 5672,
  username: 'Thomas',
  password: 'Thomas.A.Edison',
  vhost: '/',
  // http://www.squaremobius.net/amqp.node/ssl.html
  // opts: {
  //   cert: certificateAsBuffer,      client cert
  //   key: privateKeyAsBuffer,        client key
  //   passphrase: 'MySecretPassword', passphrase for key
  //   ca: [caCertAsBuffer],           array of trusted CA certs
  // },
  pool: {
    opts: {
      max: 10, // maximum size of the pool
      min: 2, // minimum size of the pool
      testOnBorrow: true,
    },
  },
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example


```
const amqp = await this.app.amqp();
const queue = 'test';
const ch = await amqp.createChannel();
await ch.assertQueue(queue);
const rst = await ch.sendToQueue(queue, Buffer.from('hello world'));
await ch.close();
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
