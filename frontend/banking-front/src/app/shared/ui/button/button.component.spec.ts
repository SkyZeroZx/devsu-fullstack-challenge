import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { ButtonComponent } from './button.component';
import { queryByCss } from '../../../spec-helpers/element.spec-helper';

@Component({
  imports: [ButtonComponent],
  template: `
    <button
      btn
      [variant]="variant()"
      [size]="size()"
      [loading]="loading()"
      data-testid="test-btn"
    >
      Click me
    </button>
  `,
})
class TestHostComponent {
  variant = signal<'primary' | 'secondary' | 'warn' | 'danger' | 'success'>(
    'primary',
  );
  size = signal<'sm' | 'lg' | 'xl' | '2xl'>('lg');
  loading = signal(false);
}

describe('ButtonComponent', () => {
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

  it('should render projected text content', async () => {
    await fixture.whenStable();
    const btn = queryByCss(fixture, '[data-testid="test-btn"]');
    expect(btn.nativeElement.textContent).toContain('Click me');
  });

  it('should apply default BEM classes (primary + lg)', async () => {
    await fixture.whenStable();
    const btn = queryByCss(fixture, '[data-testid="test-btn"]');
    const el = btn.nativeElement as HTMLElement;
    expect(el.classList.contains('btn')).toBe(true);
    expect(el.classList.contains('btn--primary')).toBe(true);
    expect(el.classList.contains('btn--lg')).toBe(true);
  });

  it('should apply variant modifier class', async () => {
    host.variant.set('danger');
    await fixture.whenStable();
    const btn = queryByCss(fixture, '[data-testid="test-btn"]');
    const el = btn.nativeElement as HTMLElement;
    expect(el.classList.contains('btn--danger')).toBe(true);
  });

  it('should apply size modifier class', async () => {
    host.size.set('sm');
    await fixture.whenStable();
    const btn = queryByCss(fixture, '[data-testid="test-btn"]');
    const el = btn.nativeElement as HTMLElement;
    expect(el.classList.contains('btn--sm')).toBe(true);
  });

  it('should set aria-busy when loading', async () => {
    host.loading.set(true);
    await fixture.whenStable();
    const btn = queryByCss(fixture, '[data-testid="test-btn"]');
    expect(btn.nativeElement.getAttribute('aria-busy')).toBe('true');
  });

  it('should not have aria-busy when not loading', async () => {
    host.loading.set(false);
    await fixture.whenStable();
    const btn = queryByCss(fixture, '[data-testid="test-btn"]');
    expect(btn.nativeElement.getAttribute('aria-busy')).toBeNull();
  });

  it('should show spinner SVG when loading', async () => {
    host.loading.set(true);
    await fixture.whenStable();
    const spinner = fixture.nativeElement.querySelector('.btn__spinner');
    expect(spinner).toBeTruthy();
    expect(spinner.getAttribute('aria-hidden')).toBe('true');
  });

  it('should not show spinner SVG when not loading', async () => {
    host.loading.set(false);
    await fixture.whenStable();
    const spinner = fixture.nativeElement.querySelector('.btn__spinner');
    expect(spinner).toBeNull();
  });

  it('should set disabled attribute when loading', async () => {
    host.loading.set(true);
    await fixture.whenStable();
    const btn = queryByCss(fixture, '[data-testid="test-btn"]');
    expect(btn.nativeElement.getAttribute('disabled')).not.toBeNull();
  });
});
