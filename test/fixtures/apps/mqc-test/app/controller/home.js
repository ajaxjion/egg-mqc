'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const amqp = await this.app.amqp();
    const queue = 'test';
    const ch = await amqp.createChannel();
    await ch.assertQueue(queue);
    const rst = await ch.sendToQueue(queue, Buffer.from('hello world'));
    await ch.close();
    this.ctx.body = 'hi, ' + this.app.plugins.mqc.name + ', ' + rst;
  }
}

module.exports = HomeController;
