'use strict';

export class PurchaseIterator {
  static create(data) {
    return {
      async *[Symbol.asyncIterator]() {
        for (const item of data) {
          // just to simulate async operation
          await Promise.resolve();
          yield item;
        }
      }
    };
  }
}

export class Basket {
  #items = [];
  #total = 0;
  #errors = [];
  #isClosed = false;
  #resolve;
  #promise;

  constructor({ limit }, onFinalize) {
    this.limit = limit;
    this.onFinalize = onFinalize;

    this.#promise = new Promise((resolve) => {
      this.#resolve = resolve;
    });
  }

  // errors could be structured better for future handling
  add(item) {
    if (this.#isClosed) {
      throw new Error('IllegalState: Cannot add items to a finalized basket.');
    }

    // In real project should be used rounding to avoid floating point precision issues
    if (this.#total + item.price > this.limit) {
      this.#errors.push(new Error(`Limit exceeded for ${item.name}: $${item.price}`));
      return;
    }

    this.#items.push(item);
    this.#total += item.price;
  }

  end() {
    if (this.#isClosed) {
      return this.#promise;
    }

    this.#isClosed = true;

    const result = {
      items: [...this.#items],
      total: this.#total,
      errors: [...this.#errors],
    };

    if (typeof this.onFinalize === 'function') {
      this.onFinalize(this.#items, this.#total);
    }

    this.#resolve(result);
    return this;
  }

  then(onFulfilled, onRejected) {
    return this.#promise.then(onFulfilled, onRejected);
  }
}
