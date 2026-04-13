import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollEndDirective } from './scroll-end.directive';

@Component({
  imports: [ScrollEndDirective],
  template: `
    <div
      appScrollEnd
      (nearEnd)="onNearEnd()"
      style="height: 100px; overflow-y: auto;"
      data-testid="scroll-container"
    >
      <div [style.height.px]="contentHeight()"></div>
    </div>
  `,
})
class TestHostComponent {
  contentHeight = signal(500);
  nearEndCalled = false;
  onNearEnd() {
    this.nearEndCalled = true;
  }
}

describe('ScrollEndDirective', () => {
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
});
