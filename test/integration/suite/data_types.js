'use strict';

const assert = require('assert').strict;
const strftime = require('strftime');

const { Bone, DataTypes } = require('../../..');
const { INTEGER, STRING, DATE, TEXT } = DataTypes;

class Note extends Bone {};
Note.init({
  id: { type: INTEGER, primaryKey: true },
  title: STRING,
  body: TEXT,
  createdAt: DATE,
});

describe('=> Data types', () => {
  before(async () => {
    await Note.driver.dropTable('notes');
    await Note.sync();
  });

  beforeEach(async () => {
    await Note.remove({});
  });

  it('STRING', async () => {
    assert.deepEqual(Note.attributes.title, {
      allowNull: true,
      columnName: 'title',
      dataType: 'varchar',
      jsType: String,
      type: STRING,
      defaultValue: null,
    });
  });

  it('DATE', async () => {
    const createdAt = new Date();
    // milliseconds in different databases is a long story, just datetime for now
    createdAt.setMilliseconds(0);
    await Note.create({ title: 'Leah', createdAt });
    const note  = await Note.first;
    assert.deepEqual(note.createdAt, createdAt);
  });

  it('validate attributes', async () => {

  });
});