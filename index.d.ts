import { Connection } from 'amqplib';

export * from 'amqplib';
import { Options } from 'amqplib/properties';

export interface ConnectCfg {
  /**
   * The to be used protocol
   *
   * Default value: 'amqp'
   */
  protocol?: string;
  /**
   * Hostname used for connecting to the server.
   *
   * Default value: 'localhost'
   */
  hostname?: string;
  /**
   * Port used for connecting to the server.
   *
   * Default value: 5672
   */
  port?: number;
  /**
   * Username used for authenticating against the server.
   *
   * Default value: 'guest'
   */
  username?: string;
  /**
   * Password used for authenticating against the server.
   *
   * Default value: 'guest'
   */
  password?: string;
  /**
   * The desired locale for error messages. RabbitMQ only ever uses en_US
   *
   * Default value: 'en_US'
   */
  locale?: string;
  /**
   * The size in bytes of the maximum frame allowed over the connection. 0 means
   * no limit (but since frames have a size field which is an unsigned 32 bit integer, it’s perforce 2^32 - 1).
   *
   * Default value: 0x1000 (4kb) - That's the allowed minimum, it will fit many purposes
   */
  frameMax?: number;
  /**
   * The period of the connection heartbeat in seconds.
   *
   * Default value: 0
   */
  heartbeat?: number;
  /**
   * What VHost shall be used.
   *
   * Default value: '/'
   */
  vhost?: string;

  pool?: {
    opts: {
      max?: number, // maximum size of the pool
      min?: number, // minimum size of the pool
      testOnBorrow?: boolean,
      [prop:string]: any
    },
  },
}


declare module 'egg' {
  interface Application {
    amqp: () => Promise<Connection>;
  }

  interface EggAppConfig {
    amqp: ConnectCfg;
  }
}

