/**
 * Returns a Promise that resolves after a `setTimeout(…, 0)` tick.
 *
 * Use this helper in tests to **flush a pending macrotask** — for example,
 * when a component uses `debounceTime(0)` (which internally schedules a
 * `setTimeout`) and the test needs the emission to have completed before
 * making assertions.
 *
 * ### Why a macrotask flush?
 *
 * `debounceTime(0)` and other RxJS operators that delegate to `setTimeout`
 * queue work on the **macrotask queue**. Awaiting `fixture.whenStable()` alone
 * only drains the *microtask* queue (Promises). By awaiting this helper we
 * yield control back to the event-loop, allowing the pending `setTimeout`
 * callback to execute, and then we can continue asserting.
 *
 * @example
 * ```ts
 * await fixture.whenStable();
 * await flushMacrotask();
 * await fixture.whenStable();
 * expect(component.items()).toHaveLength(1);
 * ```
 */
export function flushMacrotask(): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}
