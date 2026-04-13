import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectFieldComponent, SelectOption } from './select-field.component';
import {
  findEl,
  findEls,
  queryEl,
  dispatchFakeEvent,
} from '../../../../spec-helpers/element.spec-helper';

const OPTIONS: SelectOption[] = [
  { value: '', label: 'Seleccione' },
  { value: 'A', label: 'Option A' },
  { value: 'B', label: 'Option B' },
];

@Component({
  imports: [ReactiveFormsModule, SelectFieldComponent],
  template: `
    <app-select-field [label]="label()" [options]="options()" [formControl]="ctrl" />
  `,
})
class TestHostComponent {
  ctrl = new FormControl('');
  label = signal('Category');
  options = signal<SelectOption[]>(OPTIONS);
}

describe('SelectFieldComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(host).toBeTruthy();
  });

  it('renders the label with the correct text', () => {
    expect(findEl(fixture, 'label').nativeElement.textContent.trim()).toBe(
      'Category',
    );
  });

  it('associates label with trigger button via matching for/id', () => {
    const label = findEl(fixture, 'label').nativeElement as HTMLLabelElement;
    const trigger = findEl(fixture, 'trigger').nativeElement as HTMLButtonElement;
    expect(label.htmlFor).toBe(trigger.id);
    expect(trigger.id).toBeTruthy();
  });

  it('does not render a label when the label input is empty', async () => {
    host.label.set('');
    await fixture.whenStable();
    expect(queryEl(fixture, 'label')).toBeNull();
  });

  it('shows placeholder text when no value is selected', () => {
    const trigger = findEl(fixture, 'trigger').nativeElement as HTMLButtonElement;
    expect(trigger.textContent?.trim()).toContain('Seleccione');
  });

  it('opens the panel and shows options on trigger click', async () => {
    findEl(fixture, 'trigger').nativeElement.click();
    await fixture.whenStable();
    const options = findEls(fixture, 'option');
    expect(options.length).toBe(3);
    expect(options[1].nativeElement.textContent.trim()).toBe('Option A');
    expect(options[2].nativeElement.textContent.trim()).toBe('Option B');
  });

  it('selects an option on click and propagates to FormControl', async () => {
    findEl(fixture, 'trigger').nativeElement.click();
    await fixture.whenStable();
    const options = findEls(fixture, 'option');
    options[1].nativeElement.click();
    await fixture.whenStable();
    expect(host.ctrl.value).toBe('A');
  });

  it('closes the panel after selecting an option', async () => {
    findEl(fixture, 'trigger').nativeElement.click();
    await fixture.whenStable();
    findEls(fixture, 'option')[1].nativeElement.click();
    await fixture.whenStable();
    expect(queryEl(fixture, 'search')).toBeNull();
  });

  it('sets the displayed label when FormControl value changes (writeValue)', async () => {
    host.ctrl.setValue('B');
    await fixture.whenStable();
    const trigger = findEl(fixture, 'trigger').nativeElement as HTMLButtonElement;
    expect(trigger.textContent?.trim()).toContain('Option B');
  });

  it('filters options based on search input', async () => {
    findEl(fixture, 'trigger').nativeElement.click();
    await fixture.whenStable();
    const search = findEl(fixture, 'search').nativeElement as HTMLInputElement;
    search.value = 'Option A';
    dispatchFakeEvent(search, 'input');
    await fixture.whenStable();
    const options = findEls(fixture, 'option');
    expect(options.length).toBe(1);
    expect(options[0].nativeElement.textContent.trim()).toBe('Option A');
  });

  it('shows "Sin resultados" when search yields no matches', async () => {
    findEl(fixture, 'trigger').nativeElement.click();
    await fixture.whenStable();
    const search = findEl(fixture, 'search').nativeElement as HTMLInputElement;
    search.value = 'XYZ_NO_MATCH';
    dispatchFakeEvent(search, 'input');
    await fixture.whenStable();
    expect(queryEl(fixture, 'no-options')).not.toBeNull();
  });

  it('marks the FormControl as touched when the panel closes', async () => {
    expect(host.ctrl.touched).toBe(false);
    findEl(fixture, 'trigger').nativeElement.click();
    await fixture.whenStable();
    // Close by clicking the trigger again
    findEl(fixture, 'trigger').nativeElement.click();
    await fixture.whenStable();
    expect(host.ctrl.touched).toBe(true);
  });

  it('disables the trigger when the FormControl is disabled', async () => {
    host.ctrl.disable();
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'trigger').nativeElement as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('re-enables the trigger when the FormControl is re-enabled', async () => {
    host.ctrl.disable();
    await fixture.whenStable();
    host.ctrl.enable();
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'trigger').nativeElement as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  it('closes the panel with Escape key', async () => {
    findEl(fixture, 'trigger').nativeElement.click();
    await fixture.whenStable();
    const search = findEl(fixture, 'search').nativeElement as HTMLInputElement;
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    search.dispatchEvent(event);
    await fixture.whenStable();
    expect(queryEl(fixture, 'search')).toBeNull();
  });
});
