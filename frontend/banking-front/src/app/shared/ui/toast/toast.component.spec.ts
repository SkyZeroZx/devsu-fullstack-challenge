import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import {
  findEl,
  findEls,
  getText,
  queryByCss,
} from '../../../spec-helpers/element.spec-helper';
import { ToastTypes } from './constant/toast.enum';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render toast wrapper with role="alert"', async () => {
    await fixture.whenStable();
    const toast = findEl(fixture, 'toast');
    expect(toast.nativeElement.getAttribute('role')).toBe('alert');
  });

  it('should have aria-live="assertive"', async () => {
    await fixture.whenStable();
    const toast = findEl(fixture, 'toast');
    expect(toast.nativeElement.getAttribute('aria-live')).toBe('assertive');
  });

  it('should have aria-atomic="true"', async () => {
    await fixture.whenStable();
    const toast = findEl(fixture, 'toast');
    expect(toast.nativeElement.getAttribute('aria-atomic')).toBe('true');
  });

  it('should display message after open()', async () => {
    component.open({
      message: 'Test message',
      title: 'Test title',
      show: true,
      type: ToastTypes.success,
      timeout: 99999, // prevent auto-hide during test
    });
    await fixture.whenStable();

    expect(getText(fixture, 'toast-message')).toContain('Test message');
    expect(getText(fixture, 'toast-title')).toContain('Test title');
  });

  it('should apply success modifier class', async () => {
    component.open({
      message: 'Success!',
      show: true,
      type: ToastTypes.success,
      timeout: 99999,
    });
    await fixture.whenStable();

    const body = queryByCss(fixture, '.toast__body');
    expect(body.nativeElement.classList.contains('toast__body--success')).toBe(
      true,
    );
  });

  it('should apply error modifier class', async () => {
    component.open({
      message: 'Error!',
      show: true,
      type: ToastTypes.error,
      timeout: 99999,
    });
    await fixture.whenStable();

    const body = queryByCss(fixture, '.toast__body');
    expect(body.nativeElement.classList.contains('toast__body--error')).toBe(
      true,
    );
  });

  it('should apply warn modifier class', async () => {
    component.open({
      message: 'Warning!',
      show: true,
      type: ToastTypes.warn,
      timeout: 99999,
    });
    await fixture.whenStable();

    const body = queryByCss(fixture, '.toast__body');
    expect(body.nativeElement.classList.contains('toast__body--warn')).toBe(
      true,
    );
  });

  it('should apply info modifier class', async () => {
    component.open({
      message: 'Info!',
      show: true,
      type: ToastTypes.info,
      timeout: 99999,
    });
    await fixture.whenStable();

    const body = queryByCss(fixture, '.toast__body');
    expect(body.nativeElement.classList.contains('toast__body--info')).toBe(
      true,
    );
  });

  it('should add closing class when hide() is called', async () => {
    component.open({
      message: 'Will close',
      show: true,
      type: ToastTypes.info,
      timeout: 99999,
    });
    await fixture.whenStable();

    component.hide();
    await fixture.whenStable();

    const toast = findEl(fixture, 'toast');
    expect(toast.nativeElement.classList.contains('toast--closing')).toBe(true);
  });

  it('should not show title when title is not provided', async () => {
    component.open({
      message: 'No title',
      show: true,
      type: ToastTypes.success,
      timeout: 99999,
    });
    await fixture.whenStable();

    const titleEls = findEls(fixture, 'toast-title');
    expect(titleEls.length).toBe(0);
  });
});
