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
    max: 10, // maximum size of the pool
    min: 2, // minimum size of the pool
    acquireTimeoutMillis?: number,
  },
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example


* publish message to topic

```
    const amqp = await this.app.amqp();
    const exchange = 'fund';
    const ch = await amqp.createChannel();
    await ch.assertExchange(exchange, 'topic', { durable: true });
    const rst = await ch.publish(exchange, 'fund.change', Buffer.from('fund.update'), { persistent: true });
```

### define AmqpConsumer in file app/lib/amqpconsumer
```
import { Connection } from 'amqplib';
import { Application } from 'egg';

export class AmqpConsumer {
  private readonly tag: string;
  private readonly app: Application;
  private handler: (conn: Connection, tag: string) => {};

  constructor(app: Application, handler, tag?: string) {
    this.tag = tag && `[${tag}]` || '';
    this.app = app;
    this.handler = handler;
    this.process();
  }

  public process() {
    this.app.logger.info(`${this.tag} start consume...`);
    this.app.amqp().then(conn => {
      conn.on('close', () => {
        this.app.logger.info(`${this.tag} consume is closed!!!`);
        this.process();
      });
      return conn;
    }).then(conn => {
      this.app.logger.info(`${this.tag} consuming`);
      this.handler(conn, this.tag);
    }).catch(() => {
      this.app.logger.info(`${this.tag} error!`);
      this.process();
    });
  }
}
```

in app.ts  serverDidReady()
```
import { AmqpConsumer } from './app/lib/amqpconsumer';
...
async serverDidReady() {
  new AmqpConsumer(this.app, (conn, tag) => {
    const exchange = 'fund';
    const queue = 'fund.change';
    conn.createChannel().then((channel => {
      // bind on consume
      channel.assertExchange(exchange, 'topic', { durable: true });
      channel.assertQueue(queue, { durable: true});
      channel.bindQueue(queue, exchange, 'fund.change');
      channel.consume(queue, (msg: ConsumeMessage | null) => {
        if (msg) {
          let text = msg.content.toString();
          this.app.logger.info('[' + tag + '] consume', text);
          channel.ack(msg);
        }
      })
    }))
  }, 'con-hello');
}
```
## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
