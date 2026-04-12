import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogOptions } from '../../interfaces';
import {
  findEl,
  getText,
  click,
} from '../../../../../spec-helpers/element.spec-helper';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  const mockConfirmDialogOptions: ConfirmDialogOptions = {
    message: 'Mock Init Message',
    title: 'Mock Title',
    confirmButtonText: 'Confirm Mock',
    cancelButtonText: 'Cancel Mock',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    component.confirmDialogOptions.set(mockConfirmDialogOptions);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with role="alertdialog"', async () => {
    const dialog = findEl(fixture, 'dialog-component');
    expect(dialog.nativeElement.getAttribute('role')).toBe('alertdialog');
  });

  it('should have aria-modal="true"', async () => {
    const dialog = findEl(fixture, 'dialog-component');
    expect(dialog.nativeElement.getAttribute('aria-modal')).toBe('true');
  });

  it('should have aria-labelledby pointing to title', async () => {
    const dialog = findEl(fixture, 'dialog-component');
    expect(dialog.nativeElement.getAttribute('aria-labelledby')).toBe(
      'confirm-dialog-title',
    );
  });

  it('should have aria-describedby pointing to message', async () => {
    const dialog = findEl(fixture, 'dialog-component');
    expect(dialog.nativeElement.getAttribute('aria-describedby')).toBe(
      'confirm-dialog-message',
    );
  });

  it('should display title, message, and button texts', async () => {
    expect(getText(fixture, 'dialog-title').trim()).toEqual(
      mockConfirmDialogOptions.title,
    );
    expect(getText(fixture, 'dialog-message').trim()).toEqual(
      mockConfirmDialogOptions.message,
    );
    expect(getText(fixture, 'confirm-button').trim()).toEqual(
      mockConfirmDialogOptions.confirmButtonText,
    );
    expect(getText(fixture, 'cancel-button').trim()).toEqual(
      mockConfirmDialogOptions.cancelButtonText,
    );
  });

  it('should emit confirmed and remove dialog when confirm is clicked', async () => {
    const spyConfirm = jest.spyOn(component.confirmed, 'emit');
    const spyRemove = jest.spyOn(component, 'removeConfirmDialog');

    click(fixture, 'confirm-button');
    await fixture.whenStable();

    expect(spyConfirm).toHaveBeenCalled();
    expect(spyRemove).toHaveBeenCalled();
  });

  it('should emit canceled and remove dialog when cancel is clicked', async () => {
    const spyCancel = jest.spyOn(component.canceled, 'emit');
    const spyRemove = jest.spyOn(component, 'removeConfirmDialog');

    click(fixture, 'cancel-button');
    await fixture.whenStable();

    expect(spyCancel).toHaveBeenCalled();
    expect(spyRemove).toHaveBeenCalled();
  });
});
