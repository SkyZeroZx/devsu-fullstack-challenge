import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegerOnlyDirective } from './integer-only.directive';
import { findEl } from '@app/spec-helpers/element.spec-helper';

@Component({
  imports: [IntegerOnlyDirective],
  template: `<input data-testid="input" type="number" appIntegerOnly />`,
})
class AlwaysActiveHostComponent {}

@Component({
  imports: [IntegerOnlyDirective],
  template: `<input
    data-testid="input"
    type="number"
    [appIntegerOnly]="active()"
  />`,
})
class ConditionalHostComponent {
  active = signal<boolean | null>(true);
}

function makeKeydownEvent(key: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
}

function makePasteEvent(text: string): ClipboardEvent {
  return new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    clipboardData: { getData: () => text } as unknown as DataTransfer,
  });
}

describe('IntegerOnlyDirective (always active)', () => {
  let fixture: ComponentFixture<AlwaysActiveHostComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlwaysActiveHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlwaysActiveHostComponent);
    await fixture.whenStable();
    inputEl = findEl(fixture, 'input').nativeElement as HTMLInputElement;
  });

  describe('keydown', () => {
    it('prevents the period key', () => {
      const event = makeKeydownEvent('.');
      inputEl.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('prevents the comma key', () => {
      const event = makeKeydownEvent(',');
      inputEl.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('prevents lowercase e', () => {
      const event = makeKeydownEvent('e');
      inputEl.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('prevents uppercase E', () => {
      const event = makeKeydownEvent('E');
      inputEl.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('does NOT prevent digit keys', () => {
      const event = makeKeydownEvent('5');
      inputEl.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });

    it('does NOT prevent Backspace', () => {
      const event = makeKeydownEvent('Backspace');
      inputEl.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });

    it('does NOT prevent ArrowUp', () => {
      const event = makeKeydownEvent('ArrowUp');
      inputEl.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('input — sanitising decimal values', () => {
    it('truncates a decimal value to an integer', () => {
      inputEl.value = '15.6';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      expect(inputEl.value).toBe('15');
    });

    it('truncates a negative decimal value', () => {
      inputEl.value = '-3.9';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      expect(inputEl.value).toBe('-3');
    });

    it('leaves an integer value unchanged', () => {
      inputEl.value = '42';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      expect(inputEl.value).toBe('42');
    });
  });

  describe('paste', () => {
    it('prevents pasting a decimal string and inserts the integer part', () => {
      const event = makePasteEvent('12.7');
      inputEl.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(inputEl.value).toBe('12');
    });

    it('prevents pasting a string with comma separator', () => {
      const event = makePasteEvent('9,5');
      inputEl.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(inputEl.value).toBe('9');
    });

    it('prevents pasting a scientific notation string', () => {
      const event = makePasteEvent('1e3');
      inputEl.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('allows pasting a plain integer string', () => {
      const event = makePasteEvent('25');
      inputEl.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });
  });
});

describe('IntegerOnlyDirective ([appIntegerOnly] binding)', () => {
  let fixture: ComponentFixture<ConditionalHostComponent>;
  let host: ConditionalHostComponent;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConditionalHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConditionalHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
    inputEl = findEl(fixture, 'input').nativeElement as HTMLInputElement;
  });

  it('blocks decimal keys when active is true', async () => {
    host.active.set(true);
    await fixture.whenStable();
    const event = makeKeydownEvent('.');
    inputEl.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('does NOT block decimal keys when active is false', async () => {
    host.active.set(false);
    await fixture.whenStable();
    const event = makeKeydownEvent('.');
    inputEl.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('does NOT block decimal keys when active is null', async () => {
    host.active.set(null);
    await fixture.whenStable();
    const event = makeKeydownEvent('.');
    inputEl.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('does NOT truncate decimal values when inactive', async () => {
    host.active.set(false);
    await fixture.whenStable();
    inputEl.value = '7.3';
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    expect(inputEl.value).toBe('7.3');
  });
});
