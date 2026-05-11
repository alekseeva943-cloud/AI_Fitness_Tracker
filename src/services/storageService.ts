/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STORAGE_KEY = 'ai_fitness_tracker_data';

export class StorageService {
  static saveState<T>(state: T): void {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serializedState);
    } catch (e) {
      console.error('Could not save state', e);
    }
  }

  static loadState<T>(): T | undefined {
    try {
      const serializedState = localStorage.getItem(STORAGE_KEY);
      if (serializedState === null) {
        return undefined;
      }
      return JSON.parse(serializedState) as T;
    } catch (e) {
      console.error('Could not load state', e);
      return undefined;
    }
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
