/**
 * Moyun BDD Test Harness
 * Provides standard Given / When / Then BDD syntax and assertion matching.
 */

export interface TestResult {
  featureId: string;
  featureName: string;
  scenarioName: string;
  passed: boolean;
  error?: Error;
  durationMs: number;
}

export class BDDContext {
  private static results: TestResult[] = [];
  private static currentFeatureId = '';
  private static currentFeatureName = '';
  private static totalAssertions = 0;

  public static async feature(id: string, name: string, body: () => void | Promise<void>): Promise<void> {
    this.currentFeatureId = id;
    this.currentFeatureName = name;
    console.log(`\n\x1b[35m[FEATURE ${id}]\x1b[0m \x1b[1m${name}\x1b[0m`);
    await body();
  }

  public static async scenario(name: string, body: () => void | Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(`  \x1b[36mScenario:\x1b[0m ${name}`);
      await body();
      const durationMs = Date.now() - startTime;
      this.results.push({
        featureId: this.currentFeatureId,
        featureName: this.currentFeatureName,
        scenarioName: name,
        passed: true,
        durationMs
      });
      console.log(`    \x1b[32m✔ Passed\x1b[0m (${durationMs}ms)`);
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      this.results.push({
        featureId: this.currentFeatureId,
        featureName: this.currentFeatureName,
        scenarioName: name,
        passed: false,
        error: err,
        durationMs
      });
      console.log(`    \x1b[31m✘ Failed:\x1b[0m ${err.message}`);
    }
  }

  public static async step(type: 'Given' | 'When' | 'Then' | 'And', description: string, fn?: () => void | Promise<void>): Promise<void> {
    console.log(`    \x1b[90m${type}\x1b[0m ${description}`);
    if (fn) {
      await fn();
    }
  }

  public static incrementAssertion(): void {
    this.totalAssertions++;
  }

  public static getReport(): { total: number; passed: number; failed: number; assertions: number; results: TestResult[] } {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    return {
      total: this.results.length,
      passed,
      failed,
      assertions: this.totalAssertions,
      results: this.results
    };
  }

  public static reset(): void {
    this.results = [];
    this.totalAssertions = 0;
  }
}

export const feature = (id: string, name: string, body: () => void | Promise<void>) => BDDContext.feature(id, name, body);
export const scenario = (name: string, body: () => void | Promise<void>) => BDDContext.scenario(name, body);
export const given = (description: string, fn?: () => void | Promise<void>) => BDDContext.step('Given', description, fn);
export const when = (description: string, fn?: () => void | Promise<void>) => BDDContext.step('When', description, fn);
export const then = (description: string, fn?: () => void | Promise<void>) => BDDContext.step('Then', description, fn);
export const and = (description: string, fn?: () => void | Promise<void>) => BDDContext.step('And', description, fn);

export function expect(actual: any) {
  BDDContext.incrementAssertion();

  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
      }
    },
    toEqual(expected: any) {
      const actStr = JSON.stringify(actual);
      const expStr = JSON.stringify(expected);
      if (actStr !== expStr) {
        throw new Error(`Expected ${actStr} to deeply equal ${expStr}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be falsy`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be null`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual < expected) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (typeof actual !== 'number' || actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual > expected) {
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
      }
    },
    toContain(expected: any) {
      if (Array.isArray(actual)) {
        if (!actual.includes(expected)) {
          throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
        }
      } else if (typeof actual === 'string') {
        if (!actual.includes(expected)) {
          throw new Error(`Expected "${actual}" to contain "${expected}"`);
        }
      } else {
        throw new Error(`toContain called on non-iterable type: ${typeof actual}`);
      }
    },
    toThrow(expectedErrorPattern?: RegExp | string) {
      if (typeof actual !== 'function') {
        throw new Error(`toThrow called on non-function: ${typeof actual}`);
      }
      let threw = false;
      let errorMsg = '';
      try {
        actual();
      } catch (e: any) {
        threw = true;
        errorMsg = e?.message || String(e);
      }
      if (!threw) {
        throw new Error(`Expected function to throw, but it executed without error`);
      }
      if (expectedErrorPattern) {
        if (expectedErrorPattern instanceof RegExp) {
          if (!expectedErrorPattern.test(errorMsg)) {
            throw new Error(`Expected error matching ${expectedErrorPattern}, got "${errorMsg}"`);
          }
        } else if (!errorMsg.includes(expectedErrorPattern)) {
          throw new Error(`Expected error containing "${expectedErrorPattern}", got "${errorMsg}"`);
        }
      }
    }
  };
}
