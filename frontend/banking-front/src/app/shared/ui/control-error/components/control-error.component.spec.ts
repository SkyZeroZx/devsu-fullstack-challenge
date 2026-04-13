import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlErrorComponent } from './control-error.component';
import {
  expectContainedText,
  findEl,
  queryByCss,
} from '../../../../spec-helpers/element.spec-helper';

describe('ControlErrorComponent', () => {
  let component: ControlErrorComponent;
  let fixture: ComponentFixture<ControlErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlErrorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden by default when no text is provided', async () => {
    await fixture.whenStable();
    const errorDiv = queryByCss(fixture, '.control-error');
    expect(
      errorDiv.nativeElement.classList.contains('control-error--hidden'),
    ).toBe(true);
  });

  it('should display error text when text input is set', async () => {
    const textError = 'Longitud Minima es 6 caracteres';
    fixture.componentRef.setInput('text', textError);
    await fixture.whenStable();

    expect(component._hide()).toBeFalsy();
    expect(component._text()).toEqual(textError);
  });

  it('should render text in the DOM', async () => {
    const textError = 'Campo requerido';
    fixture.componentRef.setInput('text', textError);
    await fixture.whenStable();

    const errorText = findEl(fixture, 'control-error-text');
    expectContainedText(errorText, textError);
  });

  it('should have role="alert" for accessibility', async () => {
    await fixture.whenStable();
    const errorDiv = queryByCss(fixture, '.control-error');
    expect(errorDiv.nativeElement.getAttribute('role')).toBe('alert');
  });

  it('should have aria-live="polite"', async () => {
    await fixture.whenStable();
    const errorDiv = queryByCss(fixture, '.control-error');
    expect(errorDiv.nativeElement.getAttribute('aria-live')).toBe('polite');
  });

  it('should become visible when text is set then hidden when text is null', async () => {
    fixture.componentRef.setInput('text', 'Error message');
    await fixture.whenStable();

    const errorDiv = queryByCss(fixture, '.control-error');
    expect(
      errorDiv.nativeElement.classList.contains('control-error--hidden'),
    ).toBe(false);

    fixture.componentRef.setInput('text', null);
    await fixture.whenStable();

    expect(
      errorDiv.nativeElement.classList.contains('control-error--hidden'),
    ).toBe(true);
  });
});
