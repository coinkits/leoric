'use strict';

const EventEmitter = require('events');
const Connection = require('./connection');

class Pool extends EventEmitter {
  constructor(opts) {
    super(opts);
    this.options = {
      connectionLimit: 10,
      ...opts,
      client: opts.client || 'sqlite3',
    };
    this.client = require(this.options.client);
    this.connections = [];
    this.queue = [];
  }

  async getConnection() {
    const { connections, queue, client, options } = this;
    for (const connection of connections) {
      if (connection.idle) {
        connection.idle = false;
        this.emit('acquire', connection);
        return connection;
      }
    }
    if (connections.length < options.connectionLimit) {
      const connection = new Connection({ ...options, client, pool: this });
      connections.push(connection);
      this.emit('connection', connection);
      this.emit('acquire', connection);
      return connection;
    }
    await new Promise(resolve => queue.push(resolve));
    return await this.getConnection();
  }

  releaseConnection(connection) {
    connection.idle = true;
    this.emit('release', connection);

    const { queue } = this;
    while (queue.length > 0) {
      const task = queue.shift();
      task();
    }
  }
}

module.exports = Pool;