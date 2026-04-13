import { Component, OnInit, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { queryByCss } from '../../../../spec-helpers/element.spec-helper';
import { ControlErrorModule } from '../control-error.module';
import { defaultErrors } from '../form-error';

@Component({
  template: `
    <form [formGroup]="formGroupTest">
      <input type="text" id="input-test-name" formControlName="name" />
      <input
        type="text"
        id="input-test-description"
        formControlName="description"
      />
      <input type="text" id="input-test-other" formControlName="other" />
    </form>
  `,
  imports: [FormsModule, ReactiveFormsModule, ControlErrorModule],
})
class TestComponentControlError implements OnInit {
  private fb = inject(FormBuilder);
  formGroupTest!: FormGroup;
  ngOnInit(): void {
    this.formGroupTest = this.fb.group({
      name: this.fb.control('', Validators.required),
      description: this.fb.control('', Validators.minLength(3)),
      other: this.fb.control('', Validators.maxLength(2)),
    });
  }
}

describe('ControlErrorsDirective', () => {
  let component: TestComponentControlError;
  let fixture: ComponentFixture<TestComponentControlError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponentControlError],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponentControlError);
    await fixture.whenStable();
    component = fixture.componentInstance;
  });

  it('should create test component', () => {
    expect(fixture).toBeTruthy();
  });

  it('should render error when field is required', async () => {
    component.formGroupTest.controls['name'].setValue('');
    await fixture.whenStable();

    const errorTextElement = queryByCss(fixture, '#text-error');
    const text = errorTextElement.nativeElement as HTMLElement;

    expect(text).toBeDefined();
    expect(text.textContent?.trim()).toEqual(defaultErrors['required']({}));
  });

  it('should render error when field is below minlength', async () => {
    component.formGroupTest.controls['description'].setValue('12');
    await fixture.whenStable();

    const errorTextElement = queryByCss(fixture, '#text-error');
    const text = errorTextElement.nativeElement as HTMLElement;

    expect(text).toBeDefined();
    expect(text.textContent?.trim()).toEqual(
      defaultErrors['minlength']({ requiredLength: '3' }),
    );
  });

  it('should render error when field exceeds maxlength', async () => {
    component.formGroupTest.controls['other'].setValue('123');
    await fixture.whenStable();

    const errorTextElement = queryByCss(fixture, '#text-error');
    const text = errorTextElement.nativeElement as HTMLElement;

    expect(text).toBeDefined();
    expect(text.textContent?.trim()).toEqual(
      defaultErrors['maxlength']({ requiredLength: '2' }),
    );
  });
});
