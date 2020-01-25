'use strict';

const assert = require('assert').strict;
const strftime = require('strftime');

const { DataTypes } = require('../../..');
const { heresql } = require('../../../lib/utils/string');
const SqliteDriver = require('../../../lib/drivers/sqlite');

const { INTEGER, STRING, DATE } = DataTypes;

const driver = new SqliteDriver('sqlite', {
  database: '/tmp/leoric.sqlite3',
});

describe('=> SQLite driver', () => {
  it('driver.logger', async () => {
    const result = [];
    const driver2 = new SqliteDriver('sqlite', {
      database: '/tmp/leoric.sqlite3',
      logger(sql) {
        result.push(sql);
      },
    });
    await driver2.query('SELECT 1');
    assert.equal(result[0], 'SELECT 1');
  });

  it('driver.querySchemaInfo()', async () => {
    const schemaInfo = await driver.querySchemaInfo(null, 'articles');
    assert.ok(schemaInfo.articles);
    const columns = schemaInfo.articles;
    const props = [
      'columnName', 'columnType', 'dataType', 'defaultValue', 'allowNull',
    ];
    for (const column of columns) {
      for (const prop of props) assert.ok(column.hasOwnProperty(prop));
    }
  });

  it('driver.createTable(table, definitions)', async () => {
    await driver.dropTable('notes');
    await driver.createTable('notes', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      public: { type: INTEGER },
    });
  });
});

describe('=> SQLite driver.query()', () => {
  before(async () => {
    await driver.dropTable('notes');
    await driver.createTable('notes', {
      id: { type: INTEGER, primaryKey: true },
      title: STRING,
      createdAt: DATE,
    });
  });

  it('should handle timestamp correctly', async () => {
    const createdAt = new Date();
    await driver.query('INSERT INTO notes (title, created_at) VALUES (?, ?)', [
      'Leah', createdAt,
    ]);
    const {
      rows: [
        { created_at }
      ]
    } = await driver.query(heresql(`
      SELECT datetime(created_at, 'localtime') AS created_at FROM notes
    `));
    assert.equal(created_at, strftime('%Y-%m-%d %H:%M:%S', createdAt));
  });
});