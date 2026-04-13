/* eslint-disable */

import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Returns a selector for the `data-testid` attribute with the given value.
 *
 * @param testId Test id set by `data-testid`
 */
export function testIdSelector(testId: string): string {
  return `[data-testid="${testId}"]`;
}

/**
 * Finds a single element inside the Component by the given CSS selector.
 * Throws an error if no element was found.
 *
 * @param fixture Component fixture
 * @param selector CSS selector
 */
export function queryByCss<T>(
  fixture: ComponentFixture<T>,
  selector: string,
): DebugElement {
  const debugElement = fixture.debugElement.query(By.css(selector));
  if (!debugElement) {
    throw new Error(`queryByCss: Element with ${selector} not found`);
  }
  return debugElement;
}

/**
 * Finds a single element with the given `data-testid` attribute.
 *
 * @param fixture Component fixture
 * @param testId Test id set by `data-testid`
 */
export function findEl<T>(
  fixture: ComponentFixture<T>,
  testId: string,
): DebugElement {
  return queryByCss<T>(fixture, testIdSelector(testId));
}

/**
 * Finds all elements with the given `data-testid` attribute.
 *
 * @param fixture Component fixture
 * @param testId Test id set by `data-testid`
 */
export function findEls<T>(
  fixture: ComponentFixture<T>,
  testId: string,
): DebugElement[] {
  return fixture.debugElement.queryAll(By.css(testIdSelector(testId)));
}

/**
 * Queries a single element with the given `data-testid` attribute.
 * Returns `null` if the element is not found (does NOT throw).
 *
 * Use this instead of `findEl` when you need to assert that an element
 * does **not** exist in the DOM.
 *
 * @param fixture Component fixture
 * @param testId Test id set by `data-testid`
 */
export function queryEl<T>(
  fixture: ComponentFixture<T>,
  testId: string,
): DebugElement | null {
  return fixture.debugElement.query(By.css(testIdSelector(testId)));
}

/**
 * Gets the text content of an element with the given `data-testid` attribute.
 *
 * @param fixture Component fixture
 * @param testId Test id set by `data-testid`
 */
export function getText<T>(
  fixture: ComponentFixture<T>,
  testId: string,
): string {
  return findEl(fixture, testId).nativeElement.textContent;
}

/**
 * Expects that the element with the given `data-testid` attribute
 * has the given text content.
 *
 * @param fixture Component fixture
 * @param testId Test id set by `data-testid`
 * @param text Expected text
 */
export function expectText<T>(
  fixture: ComponentFixture<T>,
  testId: string,
  text: string,
): void {
  expect(getText(fixture, testId)).toBe(text);
}

/**
 * Expects that the component contains the given text.
 *
 * @param fixture Component fixture
 * @param text Expected text
 */
export function expectContainedText<T>(
  fixture: ComponentFixture<T>,
  text: string,
): void {
  expect(fixture.nativeElement.textContent).toContain(text);
}

/**
 * Expects that a component has the given text content (trimmed).
 *
 * @param fixture Component fixture
 * @param text Expected text
 */
export function expectContent<T>(
  fixture: ComponentFixture<T>,
  text: string,
): void {
  expect(fixture.nativeElement.textContent).toBe(text);
}

/**
 * Dispatches a fake event at the given element.
 *
 * @param element Element that is the target of the event
 * @param type Event name, e.g. `input`
 * @param bubbles Whether the event bubbles up in the DOM tree
 */
export function dispatchFakeEvent(
  element: EventTarget,
  type: string,
  bubbles = false,
): void {
  const event = document.createEvent('Event');
  event.initEvent(type, bubbles, false);
  element.dispatchEvent(event);
}

/**
 * Enters text into a form field (`input`, `textarea` or `select` element).
 * Triggers appropriate events so Angular takes notice of the change.
 *
 * @param element Form field
 * @param value Form field value
 */
export function setFieldElementValue(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string,
): void {
  element.value = value;
  dispatchFakeEvent(element, 'input', true);
  dispatchFakeEvent(element, 'blur', true);
}

/**
 * Sets the value of a form field with the given `data-testid` attribute.
 *
 * @param fixture Component fixture
 * @param testId Test id set by `data-testid`
 * @param value Form field value
 */
export function setFieldValue<T>(
  fixture: ComponentFixture<T>,
  testId: string,
  value: string,
): void {
  setFieldElementValue(findEl(fixture, testId).nativeElement, value);
}

/**
 * Checks or unchecks a checkbox or radio button.
 * Triggers appropriate events so Angular takes notice of the change.
 *
 * @param fixture Component fixture
 * @param testId Test id set by `data-testid`
 * @param checked Whether the checkbox or radio should be checked
 */
export function checkField<T>(
  fixture: ComponentFixture<T>,
  testId: string,
  checked: boolean,
): void {
  const { nativeElement } = findEl(fixture, testId);
  nativeElement.checked = checked;
  dispatchFakeEvent(nativeElement, 'change');
}

/**
 * Makes a fake click event that provides the most important properties.
 *
 * @param target Element that is the target of the click event
 */
export function makeClickEvent(target: EventTarget): Partial<MouseEvent> {
  return {
    preventDefault(): void {},
    stopPropagation(): void {},
    stopImmediatePropagation(): void {},
    type: 'click',
    target,
    currentTarget: target,
    bubbles: true,
    cancelable: true,
    button: 0,
  };
}

/**
 * Emulates a left click on the element with the given `data-testid` attribute.
 *
 * @param fixture Component fixture
 * @param testId Test id set by `data-testid`
 */
export function click<T>(fixture: ComponentFixture<T>, testId: string): void {
  const element = findEl(fixture, testId);
  const event = makeClickEvent(element.nativeElement);
  element.triggerEventHandler('click', event);
}

/**
 * Finds a nested Component by its selector, e.g. `app-example`.
 *
 * @param fixture Fixture of the parent Component
 * @param selector Element selector
 */
export function findComponent<T>(
  fixture: ComponentFixture<T>,
  selector: string,
): DebugElement {
  return queryByCss(fixture, selector);
}

/**
 * Finds all nested Components by their selector, e.g. `app-example`.
 *
 * @param fixture Fixture of the parent Component
 * @param selector Element selector
 */
export function findComponents<T>(
  fixture: ComponentFixture<T>,
  selector: string,
): DebugElement[] {
  return fixture.debugElement.queryAll(By.css(selector));
}
