import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InputFieldComponent } from './input-field.component';
import {
  findEl,
  dispatchFakeEvent,
} from '../../../spec-helpers/element.spec-helper';

@Component({
  imports: [ReactiveFormsModule, InputFieldComponent],
  template: `
    <app-input-field
      [label]="label()"
      [type]="type()"
      [placeholder]="placeholder()"
      [formControl]="ctrl"
    />
  `,
})
class TestHostComponent {
  ctrl = new FormControl('');
  label = signal('Email');
  type = signal<'text' | 'number' | 'password' | 'date'>('text');
  placeholder = signal('');
}

describe('InputFieldComponent', () => {
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
      'Email',
    );
  });

  it('associates label with input via matching for/id', () => {
    const label = findEl(fixture, 'label').nativeElement as HTMLLabelElement;
    const input = findEl(fixture, 'input').nativeElement as HTMLInputElement;
    expect(label.htmlFor).toBe(input.id);
    expect(input.id).toBeTruthy();
  });

  it('does not render a label when the label input is empty', async () => {
    host.label.set('');
    await fixture.whenStable();
    expect(
      fixture.debugElement.query(By.css('[data-testid="label"]')),
    ).toBeNull();
  });

  it('reflects the type input on the native input element', async () => {
    host.type.set('password');
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'input').nativeElement as HTMLInputElement).type,
    ).toBe('password');
  });

  it('sets the placeholder on the native input', async () => {
    host.placeholder.set('Enter email');
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'input').nativeElement as HTMLInputElement).placeholder,
    ).toBe('Enter email');
  });

  it('updates the native input value when FormControl value changes (writeValue)', async () => {
    host.ctrl.setValue('test@example.com');
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'input').nativeElement as HTMLInputElement).value,
    ).toBe('test@example.com');
  });

  it('propagates user input to the FormControl', async () => {
    const input = findEl(fixture, 'input').nativeElement as HTMLInputElement;
    input.value = 'hello';
    dispatchFakeEvent(input, 'input', true);
    await fixture.whenStable();
    expect(host.ctrl.value).toBe('hello');
  });

  it('marks the FormControl as touched on blur', async () => {
    expect(host.ctrl.touched).toBe(false);
    const input = findEl(fixture, 'input').nativeElement as HTMLInputElement;
    dispatchFakeEvent(input, 'blur');
    await fixture.whenStable();
    expect(host.ctrl.touched).toBe(true);
  });

  it('disables the native input when the FormControl is disabled', async () => {
    host.ctrl.disable();
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'input').nativeElement as HTMLInputElement).disabled,
    ).toBe(true);
  });

  it('re-enables the native input when the FormControl is re-enabled', async () => {
    host.ctrl.disable();
    await fixture.whenStable();
    host.ctrl.enable();
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'input').nativeElement as HTMLInputElement).disabled,
    ).toBe(false);
  });

  it('sets aria-invalid when the control is touched and invalid', async () => {
    host.ctrl.setValidators(Validators.required);
    host.ctrl.markAsTouched();
    host.ctrl.updateValueAndValidity();
    await fixture.whenStable();
    const input = findEl(fixture, 'input').nativeElement as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('does not set aria-invalid when the control is pristine', () => {
    const input = findEl(fixture, 'input').nativeElement as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });
});
