import { Counter } from '../entities/counter';

/**
 * Repository interface for Counter
 * Defines data access contract without implementation details
 */
export interface CounterRepository {
  getCounter(): Promise<Counter>;
  saveCounter(counter: Counter): Promise<void>;
}

/**
 * In-memory implementation (for demo)
 * In production, this would connect to database/API
 */
export class InMemoryCounterRepository implements CounterRepository {
  private counter: Counter = { value: 0 };

  async getCounter(): Promise<Counter> {
    return { ...this.counter };
  }

  async saveCounter(counter: Counter): Promise<void> {
    this.counter = { ...counter };
  }
}

