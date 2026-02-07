import { Counter, CounterDomain } from '@/src/domain/counter/entities/counter';
import { CounterRepository } from '@/src/domain/counter/repositories/counter-repository';

/**
 * Application Service: Counter
 * Orchestrates domain logic and repository access
 * This is the boundary between UI and domain
 */
export class CounterService {
  constructor(private repository: CounterRepository) {}

  /**
   * Get current counter state
   */
  async getCounter(): Promise<Counter> {
    return this.repository.getCounter();
  }

  /**
   * Increment counter
   */
  async increment(): Promise<Counter> {
    const counter = await this.repository.getCounter();
    const updated = CounterDomain.increment(counter);
    await this.repository.saveCounter(updated);
    return updated;
  }

  /**
   * Decrement counter
   */
  async decrement(): Promise<Counter> {
    const counter = await this.repository.getCounter();
    const updated = CounterDomain.decrement(counter);
    await this.repository.saveCounter(updated);
    return updated;
  }

  /**
   * Add amount to counter
   */
  async add(amount: number): Promise<Counter> {
    const counter = await this.repository.getCounter();
    const updated = CounterDomain.add(counter, amount);
    await this.repository.saveCounter(updated);
    return updated;
  }

  /**
   * Reset counter
   */
  async reset(initialValue: number = 0): Promise<Counter> {
    const counter = await this.repository.getCounter();
    const updated = CounterDomain.reset(counter, initialValue);
    await this.repository.saveCounter(updated);
    return updated;
  }
}

