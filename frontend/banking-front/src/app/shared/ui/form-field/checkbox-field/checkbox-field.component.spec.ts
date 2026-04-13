import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxFieldComponent } from './checkbox-field.component';
import {
  findEl,
  dispatchFakeEvent,
} from '../../../../spec-helpers/element.spec-helper';

@Component({
  imports: [ReactiveFormsModule, CheckboxFieldComponent],
  template: ` <app-checkbox-field [label]="label()" [formControl]="ctrl" /> `,
})
class TestHostComponent {
  ctrl = new FormControl(false);
  label = signal('Accept terms');
}

describe('CheckboxFieldComponent', () => {
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

  it('renders the label text', () => {
    expect(
      findEl(fixture, 'checkbox-label').nativeElement.textContent,
    ).toContain('Accept terms');
  });

  it('associates the label with the checkbox via matching for/id', () => {
    const label = findEl(fixture, 'checkbox-label')
      .nativeElement as HTMLLabelElement;
    const checkbox = findEl(fixture, 'checkbox')
      .nativeElement as HTMLInputElement;
    expect(label.htmlFor).toBe(checkbox.id);
    expect(checkbox.id).toBeTruthy();
  });

  it('is unchecked by default', () => {
    expect(
      (findEl(fixture, 'checkbox').nativeElement as HTMLInputElement).checked,
    ).toBe(false);
  });

  it('reflects a true value via CVA writeValue', async () => {
    host.ctrl.setValue(true);
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'checkbox').nativeElement as HTMLInputElement).checked,
    ).toBe(true);
  });

  it('reflects a false value via CVA writeValue', async () => {
    host.ctrl.setValue(true);
    await fixture.whenStable();
    host.ctrl.setValue(false);
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'checkbox').nativeElement as HTMLInputElement).checked,
    ).toBe(false);
  });

  it('propagates checked state to FormControl on change', async () => {
    const checkbox = findEl(fixture, 'checkbox')
      .nativeElement as HTMLInputElement;
    checkbox.checked = true;
    dispatchFakeEvent(checkbox, 'change', true);
    await fixture.whenStable();
    expect(host.ctrl.value).toBe(true);
  });

  it('propagates unchecked state to FormControl on change', async () => {
    host.ctrl.setValue(true);
    await fixture.whenStable();
    const checkbox = findEl(fixture, 'checkbox')
      .nativeElement as HTMLInputElement;
    checkbox.checked = false;
    dispatchFakeEvent(checkbox, 'change', true);
    await fixture.whenStable();
    expect(host.ctrl.value).toBe(false);
  });

  it('marks the FormControl as touched on blur', async () => {
    expect(host.ctrl.touched).toBe(false);
    const checkbox = findEl(fixture, 'checkbox')
      .nativeElement as HTMLInputElement;
    dispatchFakeEvent(checkbox, 'blur');
    await fixture.whenStable();
    expect(host.ctrl.touched).toBe(true);
  });

  it('disables the checkbox when the FormControl is disabled', async () => {
    host.ctrl.disable();
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'checkbox').nativeElement as HTMLInputElement).disabled,
    ).toBe(true);
  });

  it('re-enables the checkbox when the FormControl is re-enabled', async () => {
    host.ctrl.disable();
    await fixture.whenStable();
    host.ctrl.enable();
    await fixture.whenStable();
    expect(
      (findEl(fixture, 'checkbox').nativeElement as HTMLInputElement).disabled,
    ).toBe(false);
  });
});
