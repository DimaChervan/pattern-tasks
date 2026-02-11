import { test } from 'node:test';
import assert from 'node:assert';
import { PurchaseIterator, Basket } from './solution.js';

test('PurchaseIterator.create returns async iterable and iterates all items', async () => {
  const data = [
    { name: 'A', price: 10 },
    { name: 'B', price: 20 },
    { name: 'C', price: 30 }
  ];
  
  const iterator = PurchaseIterator.create(data);
  
  const items = [];
  for await (const item of iterator) {
    items.push(item);
  }
  
  assert.deepStrictEqual(items, [
    { name: 'A', price: 10 },
    { name: 'B', price: 20 },
    { name: 'C', price: 30 }
  ], 'all items match expected structure');
});

test('PurchaseIterator handles empty array', async () => {
  const iterator = PurchaseIterator.create([]);
  const items = [];
  
  for await (const item of iterator) {
    items.push(item);
  }
  
  assert.strictEqual(items.length, 0, 'no items for empty array');
});

test('Basket adds items within limit and calculates total', async () => {
  const basket = new Basket({ limit: 100 }, null);
  
  basket.add({ name: 'Item1', price: 30 });
  basket.add({ name: 'Item2', price: 40 });
  
  basket.end();
  const result = await basket;
  
  assert.deepStrictEqual(result, {
    items: [
      { name: 'Item1', price: 30 },
      { name: 'Item2', price: 40 }
    ],
    total: 70,
    errors: []
  }, 'result structure matches');
});

test('Basket rejects items exceeding limit', async () => {
  const basket = new Basket({ limit: 100 }, null);
  
  basket.add({ name: 'Item1', price: 50 });
  basket.add({ name: 'Item2', price: 60 });
  
  basket.end();
  const result = await basket;
  
  assert.strictEqual(result.items.length, 1, 'only one item added');
  assert.deepStrictEqual(result.items[0], { name: 'Item1', price: 50 }, 'first item added');
  assert.strictEqual(result.total, 50, 'total is 50');
  assert.strictEqual(result.errors.length, 1, 'one error recorded');
  assert(result.errors[0] instanceof Error, 'error is Error instance');
});

test('Basket handles exact limit', async () => {
  const basket = new Basket({ limit: 100 }, null);
  
  basket.add({ name: 'Item1', price: 50 });
  basket.add({ name: 'Item2', price: 50 });
  
  basket.end();
  const result = await basket;
  
  assert.deepStrictEqual(result, {
    items: [
      { name: 'Item1', price: 50 },
      { name: 'Item2', price: 50 }
    ],
    total: 100,
    errors: []
  }, 'result structure matches');
});

test('Basket prevents adding after end()', () => {
  const basket = new Basket({ limit: 100 }, null);
  
  basket.add({ name: 'Item1', price: 50 });
  basket.end();
  
  assert.throws(
    () => basket.add({ name: 'Item2', price: 30 }),
    {
      name: 'Error',
      message: /IllegalState/
    },
    'throws IllegalState error'
  );
});

test('Basket records multiple limit errors', async () => {
  const basket = new Basket({ limit: 100 }, null);
  
  basket.add({ name: 'Item1', price: 50 });
  basket.add({ name: 'Item2', price: 60 }); // Error 1
  basket.add({ name: 'Item3', price: 70 }); // Error 2
  
  basket.end();
  const result = await basket;
  
  assert.strictEqual(result.items.length, 1, 'only first item added');
  assert.strictEqual(result.errors.length, 2, 'two errors recorded');
});

test('Basket calls callback with items and total', () => {
  let callbackItems = null;
  let callbackTotal = null;
  
  const basket = new Basket({ limit: 100 }, (items, total) => {
    callbackItems = items;
    callbackTotal = total;
  });
  
  basket.add({ name: 'Item1', price: 30 });
  basket.add({ name: 'Item2', price: 40 });
  basket.end();
  
  assert.notStrictEqual(callbackItems, null, 'callback was called');
  assert.deepStrictEqual(callbackItems, [
    { name: 'Item1', price: 30 },
    { name: 'Item2', price: 40 }
  ], 'callback received correct items');
  assert.strictEqual(callbackTotal, 70, 'callback received total 70');
});

test('Basket then() can be chained', async () => {
  const basket = new Basket({ limit: 100 }, null);
  
  basket.add({ name: 'Item1', price: 50 });
  basket.end();
  
  const result = await basket.then(r => ({ ...r, processed: true }));
  
  assert.strictEqual(result.processed, true, 'chain worked');
  assert.strictEqual(result.items.length, 1, 'original data preserved');
  assert.strictEqual(result.total, 50, 'total preserved');
});

test('Basket end() can be called multiple times safely', async () => {
  const basket = new Basket({ limit: 100 }, null);
  
  basket.add({ name: 'Item1', price: 50 });
  
  const result1 = basket.end();
  const result2 = basket.end();
  
  const data1 = await result1;
  const data2 = await result2;
  
  assert.strictEqual(data1.total, data2.total, 'same result returned');
  assert.strictEqual(data1.items.length, data2.items.length, 'same items');
});

test('PurchaseIterator + Basket integration', async () => {
  const purchase = [
    { name: 'Laptop', price: 1500 },
    { name: 'Mouse', price: 25 },
    { name: 'Keyboard', price: 100 }
  ];
  
  const goods = PurchaseIterator.create(purchase);
  const basket = new Basket({ limit: 2000 }, () => {});
  
  for await (const item of goods) {
    basket.add(item);
  }
  
  basket.end();
  const result = await basket;
  
  assert.strictEqual(result.items.length, 3, 'all items added');
  assert.strictEqual(result.total, 1625, 'total is 1625');
});
