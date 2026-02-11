import { PurchaseIterator, Basket } from './solution.js';

const purchase = [
    { name: 'Laptop', price: 1500 },
    { name: 'Mouse', price: 25 },
    { name: 'Keyboard', price: 100 },
    { name: 'HDMI cable', price: 10 },
    { name: 'Bag', price: 50 },
    { name: 'Mouse pad', price: 5 },
];

export const main = async (purchase, limit) => {
    const goods = PurchaseIterator.create(purchase);
    
    const basket = new Basket({ limit }, (items, total) => {
      console.log(`[Callback] Final total: $${total}`);
    });
  
    for await (const item of goods) {
      basket.add(item);
    }
  
    basket.end();
  
    const { items, total, errors } = await basket;
  
    console.log('\n--- Final Basket State ---');
    console.log('Items bought:', items.map(i => i.name).join(', '));
    console.log('Total cost:', total);
    
    if (errors.length > 0) {
      console.error('Escalated Errors:', errors);
    }
  };

main(purchase, 2000).catch(console.error);
