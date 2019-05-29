'use strict';
const amqplib = require('amqplib');
const genericPool = require('generic-pool');
const debug = require('debug')('egg-mqc');

const myPool = Symbol('egg-mac#pool');

function factory(config) {
  return {
    create: () => {
      debug('[egg-mqc] create new client');
      return amqplib.connect(config, config.opts).then(conn => {
        conn.on('close', () => {
          debug('on close');
        });
        return conn;
      });
    },
    destroy: client => {
      debug('[egg-mqc] destroy client');
      client.close().catch(() => {});
      return Promise.resolve();
    },
    validate: client => {
      return client.createChannel()
        .then(channel => {
          channel.close();
          return true;
        }).catch(() => false);
    },
  };
}


function initPool(app, config) {
  if (!app[myPool]) {
    debug('[egg-mqc] create pool');
    app[myPool] = genericPool.createPool(factory(config), { testOnBorrow: true, testOnReturn: true, ...config.pool });
  }
}

module.exports = app => {
  app.beforeStart(() => {
    const config = app.config.amqp;
    try {
      initPool(app, config);
      app.amqp = function() {
        debug('[egg-mqc] get client');
        return app[myPool].acquire().then(client => {
          debug('[egg-mqc] release client');
          app[myPool].release(client);
          return client;
        });
      };
    } catch (err) {
      app.coreLogger.error(`[egg-mqc] ${err.toString()}`);
    }
  });
  app.beforeClose(async () => {
    await app[myPool].drain().then(function() {
      app[myPool].clear();
    });
  });
};
