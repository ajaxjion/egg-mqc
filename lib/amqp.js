'use strict';
const amqplib = require('amqplib');
const genericPool = require('generic-pool');
const debug = require('debug')('egg-mqc');

let myPool;

function factory(config) {
  return {
    create() {
      debug('create pool new client');
      return amqplib.connect(config, config.opts).then(conn => {
        conn.on('close', () => {
          debug('on close');
        });
        return conn;
      });
    },
    destroy(client) {
      debug('destroy pool client');
      client.close().catch(() => {});
      return Promise.resolve();
    },
    validate(client) {
      return client.createChannel().then(() => true).catch(() => false);
    },
  };
}

function initPool(config) {
  if (!myPool) {
    myPool = genericPool.createPool(factory(config), config.pool);
  }
  return myPool;
}

module.exports = app => {
  app.beforeStart(async () => {
    const config = app.config.amqp;
    try {
      initPool(config);
      app.amqp = function() {
        return myPool.acquire().then(client => {
          myPool.release(client);
          return client;
        });
      };
      await app.amqp();
    } catch (err) {
      app.coreLogger.error(`[egg-amqp] ${err.toString()}`);
    }
  });
  app.beforeClose(async () => {
    await myPool.drain().then(function() {
      myPool.clear();
    });
  });
};
