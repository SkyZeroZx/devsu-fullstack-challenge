import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SelectFieldComponent } from './select-field.component';
import {
  findEl,
  dispatchFakeEvent,
} from '../../../spec-helpers/element.spec-helper';

@Component({
  imports: [ReactiveFormsModule, SelectFieldComponent],
  template: `
    <app-select-field [label]="label()" [formControl]="ctrl">
      <option value="">Seleccione</option>
      <option value="A">Option A</option>
      <option value="B">Option B</option>
    </app-select-field>
  `,
})
class TestHostComponent {
  ctrl = new FormControl('');
  label = signal('Category');
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

  it('associates label with select via matching for/id', () => {
    const label = findEl(fixture, 'label').nativeElement as HTMLLabelElement;
    const select = findEl(fixture, 'select').nativeElement as HTMLSelectElement;
    expect(label.htmlFor).toBe(select.id);
    expect(select.id).toBeTruthy();
  });

  it('does not render a label when the label input is empty', async () => {
    host.label.set('');
    await fixture.whenStable();
    expect(
      fixture.debugElement.query(By.css('[data-testid="label"]')),
    ).toBeNull();
  });

  it('projects options inside the native select', () => {
    const options = (
      findEl(fixture, 'select').nativeElement as HTMLSelectElement
    ).options;
    expect(options.length).toBe(3);
    expect(options[1].value).toBe('A');
    expect(options[2].value).toBe('B');
  });

  it('sets the select value when FormControl value changes (writeValue)', async () => {
    host.ctrl.setValue('B');
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'select').nativeElement as HTMLSelectElement).value,
    ).toBe('B');
  });

  it('propagates selection change to the FormControl', async () => {
    const select = findEl(fixture, 'select').nativeElement as HTMLSelectElement;
    select.value = 'A';
    dispatchFakeEvent(select, 'change', true);
    await fixture.whenStable();
    expect(host.ctrl.value).toBe('A');
  });

  it('marks the FormControl as touched on blur', async () => {
    expect(host.ctrl.touched).toBe(false);
    const select = findEl(fixture, 'select').nativeElement as HTMLSelectElement;
    dispatchFakeEvent(select, 'blur');
    await fixture.whenStable();
    expect(host.ctrl.touched).toBe(true);
  });

  it('disables the native select when the FormControl is disabled', async () => {
    host.ctrl.disable();
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'select').nativeElement as HTMLSelectElement).disabled,
    ).toBe(true);
  });

  it('re-enables the native select when the FormControl is re-enabled', async () => {
    host.ctrl.disable();
    await fixture.whenStable();
    host.ctrl.enable();
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'select').nativeElement as HTMLSelectElement).disabled,
    ).toBe(false);
  });
});
