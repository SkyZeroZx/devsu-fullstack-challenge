import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { ModalService } from '../services/modal.service';
import { findEl } from '../../../../spec-helpers/element.spec-helper';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [ModalService],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render modal container with role="dialog"', async () => {
    await fixture.whenStable();
    const container = findEl(fixture, 'modal-container');
    expect(container.nativeElement.getAttribute('role')).toBe('dialog');
  });

  it('should have aria-modal="true"', async () => {
    await fixture.whenStable();
    const container = findEl(fixture, 'modal-container');
    expect(container.nativeElement.getAttribute('aria-modal')).toBe('true');
  });

  it('should render close button with aria-label', async () => {
    await fixture.whenStable();
    const closeBtn = findEl(fixture, 'modal-close-btn');
    expect(closeBtn.nativeElement.getAttribute('aria-label')).toBe('Cerrar');
  });

  it('should apply modal--enter class when show is true', async () => {
    await fixture.whenStable();
    const container = findEl(fixture, 'modal-container');
    expect(container.nativeElement.classList.contains('modal--enter')).toBe(
      true,
    );
  });

  it('should apply modal--leave class after close()', async () => {
    component.close();
    await fixture.whenStable();
    const container = findEl(fixture, 'modal-container');
    expect(container.nativeElement.classList.contains('modal--leave')).toBe(
      true,
    );
  });

  it('should render as dialog mode when mode is dialog', async () => {
    component.mode.set('dialog');
    await fixture.whenStable();
    const container = findEl(fixture, 'modal-container');
    expect(container.nativeElement.classList.contains('dialog')).toBe(true);
  });

  it('should render bottom sheet when mode is bottom-sheet', async () => {
    component.mode.set('bottom-sheet');
    await fixture.whenStable();
    const container = findEl(fixture, 'bottom-sheet-container');
    expect(container.nativeElement.getAttribute('role')).toBe('dialog');
  });
});
