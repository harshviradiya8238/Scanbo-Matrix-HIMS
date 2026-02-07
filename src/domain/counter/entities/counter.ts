/**
 * Domain Entity: Counter
 * Pure business logic, no framework dependencies
 */

export interface Counter {
  value: number;
  readonly maxValue?: number;
  readonly minValue?: number;
}

/**
 * Domain rules for Counter
 */
export class CounterDomain {
  /**
   * Check if counter can be incremented
   */
  static canIncrement(counter: Counter): boolean {
    if (counter.maxValue === undefined) return true;
    return counter.value < counter.maxValue;
  }

  /**
   * Check if counter can be decremented
   */
  static canDecrement(counter: Counter): boolean {
    if (counter.minValue === undefined) return true;
    return counter.value > counter.minValue;
  }

  /**
   * Increment counter (business logic)
   */
  static increment(counter: Counter): Counter {
    if (!this.canIncrement(counter)) {
      throw new Error('Cannot increment: maximum value reached');
    }
    return {
      ...counter,
      value: counter.value + 1,
    };
  }

  /**
   * Decrement counter (business logic)
   */
  static decrement(counter: Counter): Counter {
    if (!this.canDecrement(counter)) {
      throw new Error('Cannot decrement: minimum value reached');
    }
    return {
      ...counter,
      value: counter.value - 1,
    };
  }

  /**
   * Add amount to counter (business logic)
   */
  static add(counter: Counter, amount: number): Counter {
    const newValue = counter.value + amount;
    if (counter.maxValue !== undefined && newValue > counter.maxValue) {
      throw new Error('Cannot add: would exceed maximum value');
    }
    if (counter.minValue !== undefined && newValue < counter.minValue) {
      throw new Error('Cannot add: would exceed minimum value');
    }
    return {
      ...counter,
      value: newValue,
    };
  }

  /**
   * Reset counter (business logic)
   */
  static reset(counter: Counter, initialValue: number = 0): Counter {
    return {
      ...counter,
      value: initialValue,
    };
  }
}

