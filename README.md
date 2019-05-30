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

* app/extends/application.ts

```
  /**
   * publish data to topic 
   * @param this 
   * @param topicKey 
   * @param data 
   */
  mqPublish(this: Application, topicKey: string, data: Buffer) {
    const exchange = 'amq.topic';
    return this.amqp()
    .then(conn => conn.createChannel())
    .then(channel => {
      const result = channel.publish(exchange, topicKey, data, { persistent: true });
      channel.close();
      return result;
    })
    .catch(() => false);
  }
```

* publish message to topic

```
    const rst = await this.app.mqPublish('this_is_your_topic', Buffer.from('hello there'));
```

* consume in app.ts

```
  async serverDidReady() {
    // Server is listening.
    subscribe(this.app, "#", "fund.queue", (channel: Channel, msg: ConsumeMessage | null) => {
      if (msg) {
        let text = msg.content.toString();
        let { exchange, routingKey } = msg.fields;
        this.app.logger.info(` - [${exchange}, ${routingKey}] ${text}`);
        channel.ack(msg);
      }
    });
  }
```

### define AmqpConsumer in file app/lib/amqpconsumer
```
import { Connection, ConsumeMessage, Channel } from 'amqplib';
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

/**
 * 订阅消息
 * 使用示例
 * subscribe(this.app, "#", "fund.queue", (channel: Channel, msg: ConsumeMessage | null) => {
      if (msg) {
        let text = msg.content.toString();
        let { exchange, routingKey } = msg.fields;
        this.app.logger.info(`[${exchange}, ${routingKey}] ${text}`);
        channel.ack(msg);
      }
    });
 * @param app 
 * @param topic 主题名字
 * @param queue 消息队列名字
 * @param handler 订阅处理，处理完消息务必调用channel.ack(msg)
 */
export function subscribe(app: Application, topic: string, queue: string, handler: (channel: Channel, msg: ConsumeMessage | null) => void) {
  new AmqpConsumer(app, (conn) => {
    const exchange = 'amq.topic';
    conn.createChannel().then((channel => {
      // 消费时，绑定队列到exchange
      channel.assertExchange(exchange, 'topic', { durable: true });
      channel.assertQueue(queue, { durable: true });
      channel.bindQueue(queue, exchange, topic);
      channel.consume(queue, (msg) => {
        try {
          handler(channel, msg);
        } catch (err) {
          app.logger.error(`consume ${queue} error ${err}`);
        }
      });
    }))
  }, topic);
}
```
## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
