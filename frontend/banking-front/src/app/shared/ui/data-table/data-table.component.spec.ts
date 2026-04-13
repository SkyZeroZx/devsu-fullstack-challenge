import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { DataTableComponent } from './data-table.component';
import { TableColumnDirective } from './table-column.directive';
import {
  findEl,
  findEls,
  queryEl,
} from '../../../spec-helpers/element.spec-helper';

interface Row {
  id: number;
  name: string;
}

@Component({
  imports: [DataTableComponent, TableColumnDirective],
  template: `
    <app-data-table
      [rows]="rows()"
      [totalElements]="total()"
      [page]="page()"
      [size]="10"
      [loading]="loading()"
      ariaLabel="Test table"
      emptyMessage="Sin elementos"
      (pageChange)="onPageChange($event)"
    >
      <ng-template
        appTableColumn="id"
        header="ID"
        [appTableColumnOf]="rows()"
        let-row
      >
        <span data-testid="cell-id">{{ row.id }}</span>
      </ng-template>
      <ng-template
        appTableColumn="name"
        header="Name"
        [appTableColumnOf]="rows()"
        let-row
      >
        <span data-testid="cell-name">{{ row.name }}</span>
      </ng-template>
    </app-data-table>
  `,
})
class TestHostComponent {
  rows = signal<Row[]>([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]);
  total = signal(2);
  page = signal(1);
  loading = signal(false);
  emittedPage: number | null = null;

  onPageChange(p: number): void {
    this.emittedPage = p;
  }
}

describe('DataTableComponent', () => {
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

  it('renders the table when not loading', () => {
    expect(findEl(fixture, 'table').nativeElement).toBeTruthy();
    expect(queryEl(fixture, 'skeleton')).toBeNull();
  });

  it('renders the skeleton and hides the table while loading', async () => {
    host.loading.set(true);
    await fixture.whenStable();
    expect(findEl(fixture, 'skeleton').nativeElement).toBeTruthy();
    expect(queryEl(fixture, 'table')).toBeNull();
  });

  it('sets aria-label on the table element', () => {
    expect(
      findEl(fixture, 'table').nativeElement.getAttribute('aria-label'),
    ).toBe('Test table');
  });

  it('renders a header column for each TableColumnDirective', () => {
    const headers = findEls(fixture, 'column-header');
    expect(headers.length).toBe(2);
    expect(headers[0].nativeElement.textContent.trim()).toBe('ID');
    expect(headers[1].nativeElement.textContent.trim()).toBe('Name');
  });

  it('renders a row for every item in rows input', () => {
    const idCells = findEls(fixture, 'cell-id');
    expect(idCells.length).toBe(2);
    expect(idCells[0].nativeElement.textContent.trim()).toBe('1');
    expect(idCells[1].nativeElement.textContent.trim()).toBe('2');
  });

  it('renders cell content via the column template', () => {
    const nameCells = findEls(fixture, 'cell-name');
    expect(nameCells[0].nativeElement.textContent.trim()).toBe('Alice');
    expect(nameCells[1].nativeElement.textContent.trim()).toBe('Bob');
  });

  it('shows the empty message when rows is empty', async () => {
    host.rows.set([]);
    await fixture.whenStable();
    const empty = findEl(fixture, 'empty-message');
    expect(empty.nativeElement.textContent.trim()).toBe('Sin elementos');
  });

  it('hides the empty message when rows is not empty', () => {
    expect(queryEl(fixture, 'empty-message')).toBeNull();
  });

  it('forwards pageChange events from the paginator', async () => {
    host.total.set(30);
    await fixture.whenStable();
    findEl(fixture, 'btn-next').nativeElement.click();
    await fixture.whenStable();
    expect(host.emittedPage).toBe(2);
  });
});
