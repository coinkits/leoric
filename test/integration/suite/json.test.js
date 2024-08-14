'use strict';

const assert = require('assert').strict;

const { Bone } = require('../../../src');

describe('=> Basic', () => {

  describe('=> JSON Functions', ()=>{

    class Gen extends Bone { }
    Gen.init({
      id: { type: Bone.DataTypes.INTEGER, primaryKey: true },
      name: Bone.DataTypes.STRING,
      extra: Bone.DataTypes.JSONB,
      deleted_at: Bone.DataTypes.DATE,
    });

    before(async () => {
      await Bone.driver.dropTable('gens');
      await Gen.sync();
    });

    after(async () => {
      await Bone.driver.dropTable('gens');
    });

    beforeEach(async () => {
      await Gen.remove({}, true);
    });

    it('bone.jsonMerge(name, values, options) should work', async () => {
      const gen = await Gen.create({ name: '章3️⃣疯' });
      assert.equal(gen.name, '章3️⃣疯');
      await gen.update({ extra: { a: 1 } });
      assert.equal(gen.extra.a, 1);
      await gen.jsonMerge('extra', { b: 2, a: 3 });
      assert.equal(gen.extra.a, 3);
      assert.equal(gen.extra.b, 2);

      await gen.jsonMerge('extra', {a: 10, b: 10, c: 1},{ method: 'JSON_MERGE_PRESERVE' });
      assert.equal(gen.extra.a, 10);
      assert.equal(gen.extra.b, 10);
      assert.equal(gen.extra.c, 1);

      const gen2 = await Gen.create({ name: 'gen2', extra: { test: 1 }});
      assert.equal(gen2.extra.test, 1);
      await gen.jsonMerge('extra', { url: 'https://www.wanxiang.art/?foo=' });
      assert.equal(gen.extra.url, 'https://www.wanxiang.art/?foo=');
    });
  });
});
