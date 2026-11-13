# AGENTS.md - Angular Grid Component

## Project Overview

**@open-dcp/angular-grid** is an **Angular wrapper component** for the framework-agnostic `@open-dcp/grid` GridService. It provides a high-performance, virtual-scrolling data grid with filtering, sorting, and column formatting capabilities, designed to handle large datasets with minimal memory consumption.

## Architecture

### Project Structure
```
angular-grid/
├── projects/open-dcp/angular-grid/src/
│   ├── lib/
│   │   ├── grid/              # DcGridComponent (main)
│   │   ├── table/             # Sub-components: HeaderCell, BodyCell, etc.
│   │   └── services/          # Grid-specific helpers
│   ├── grid.ts                # Public exports
│   ├── stories/               # Storybook stories
│   ├── public-api.ts
│   └── styles.scss
├── angular.json
└── package.json
```

### Component Hierarchy
```
DcGridComponent (wrapper)
├── ngFor row visualization (virtual scrolling)
│   ├── HeaderRow (sorting, filtering UI)
│   ├── BodyRow (cell rendering)
│   │   ├── DcHeaderCellComponent
│   │   ├── DcBodyCellComponent
│   │   ├── DcHeaderCellFilterComponent
│   │   └── DcThreeDotsMenuComponent
```

## Core Component: DcGridComponent

### Main Component Template
```typescript
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { GridService } from '@open-dcp/grid';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'odcp-grid',
  standalone: true,
  templateUrl: './grid.component.html',
  imports: [CommonModule, DcHeaderCellComponent, DcBodyCellComponent],
  encapsulation: ViewEncapsulation.None
})
export class DcGridComponent implements OnInit {
  @Input() rows: Row[];
  @Input() columns: Column[];
  @Input() gridOptions?: Partial<GridOptions>;
  
  gridService: GridService;
  renderedRows$: Observable<RenderRow[]>;
  
  ngOnInit() {
    this.gridService = new GridService(
      this.rows, 
      this.columns, 
      this.gridOptions
    );
    this.renderedRows$ = this.gridService.getRenderRows$();
  }
}
```

### Sub-Components

#### DcHeaderCellComponent
Handles column header rendering, sorting toggle, filtering UI:
```typescript
@Component({
  selector: 'odcp-header-cell',
  standalone: true
})
export class DcHeaderCellComponent {
  @Input() column: Column;
  @Output() sortChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<FilteringCondition>();
  
  onSort() {
    this.gridService.toggleSort(this.column.key);
  }
}
```

#### DcBodyCellComponent
Renders cell content with formatting applied by FormattingService:
```typescript
@Component({
  selector: 'odcp-body-cell',
  standalone: true
})
export class DcBodyCellComponent {
  @Input() cell: DisplayValue;  // { raw, value } from GridService
  @Input() column: Column;
  
  ngOnInit() {
    // cell.value already formatted (date, currency, etc.)
  }
}
```

#### DcThreeDotsMenuComponent
Row action menu (edit, delete, etc.):
```typescript
@Component({
  selector: 'odcp-three-dots-menu',
  standalone: true
})
export class DcThreeDotsMenuComponent {
  @Input() rowData: Row;
  @Output() action = new EventEmitter<{ action: string, rowData: Row }>();
}
```

## GridService Integration

### Data Flow
```
Input: rows[], columns[]
         ↓
GridService (constructor)
├── FilteringService (applies active filters)
├── SortingService (applies active sorts)
├── RowHeightService (calculates virtual scroll heights)
├── FormattingService (formats cell values)
└── SelectionService (tracks row selections)
         ↓
Output: renderedRows$ Observable (only visible rows)
```

### Key Observable Patterns
```typescript
// All public GridService observables have $ suffix
gridService.rows$           // All rows (unfiltered)
gridService.columns$        // All columns
gridService.displayFormat$  // Date/time/timezone format
gridService.filterSort$     // Current filter + sort state
gridService.rowCount$       // Total visible rows

// Subscribe in component
this.gridService.rows$.subscribe(rows => {
  // Trigger change detection
});
```

## Virtual Scrolling

### Container Attachment
```typescript
// Component
@ViewChild('gridContainer') container: ElementRef;

ngAfterViewInit() {
  this.gridService.attachContainer(this.container.nativeElement);
}

// Template
<div #gridContainer class="grid-container" (scroll)="onScroll($event)">
  <div *ngFor="let row of renderedRows$ | async" class="row">
    <!-- cells -->
  </div>
</div>
```

### Scroll Event Handling
```typescript
onScroll(event: Event) {
  this.gridService.handleScroll(event);
  // GridService recalculates visible rows, emits renderedRows$
}
```

## Filtering & Sorting

### Toggle Sort
```typescript
sortColumn(columnKey: string) {
  this.gridService.toggleSort(columnKey);
  // Cycles: unsorted → asc → desc → unsorted
}
```

### Add Filter
```typescript
addFilter(columnKey: string, filterValue: any) {
  this.gridService.addFilter({
    key: columnKey,
    value: filterValue
  });
}

resetFilter() {
  this.gridService.resetFilter();
}
```

## Developer Workflow

### Build & Test
```bash
npm install
npm run watch              # ng build --watch
npm run build              # ng build (production)
npm run storybook          # Storybook dev
npm test                   # Karma + Jasmine
```

### Storybook Story Example
```typescript
import { Meta, StoryObj } from '@storybook/angular';
import { DcGridComponent } from '../lib/grid/grid.component';

export const LargeDataset: StoryObj = {
  args: {
    rows: generateMockRows(10000),  // Virtual scroll handles this
    columns: [
      { key: 'id', label: 'ID', type: 'integer' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'date', label: 'Date', type: 'date' }
    ],
    gridOptions: {
      displayFormat: {
        dateFormat: 'yyyy-MM-dd',
        timeFormat: 'HH:mm:ss'
      }
    }
  }
};
```

## Key Dependencies

### @open-dcp/grid
- **GridService**: Main orchestrator
- **FilteringService**: Filter logic
- **SortingService**: Sort logic
- **RowHeightService**: Virtual scroll heights
- **FormattingService**: Cell value formatting
- **SelectionService**: Row selection tracking

### Angular 17.3
- **@angular/common**: CommonModule, *ngFor
- **@angular/cdk**: Virtual scrolling (optional)

### @open-dcp/services
- **uiStore**: Date/time formatting preferences
- **userStore**: Timezone for display

## Common Patterns

### 1. **Row Selection**
```typescript
// In component
selectedRows = new Set<number>();

onRowClick(row: Row) {
  this.gridService.toggleRowSelection(row.index);
}

// In template
<tr [class.selected]="selectedRows.has(row.index)">
```

### 2. **Column Width Customization**
```typescript
<odcp-grid 
  [columns]="columns"
  [rows]="rows"
  [columnWidths]="{ id: 50, name: 200, date: 150 }">
</odcp-grid>
```

### 3. **Real-Time Data Updates**
```typescript
// GridService auto-refreshes on setRows()
this.dataService.rows$.subscribe(newRows => {
  this.gridService.setRows(newRows);
  // Grid automatically re-renders only visible rows
});
```

## Testing

### Mocking GridService
```typescript
import { GridService } from '@open-dcp/grid';

describe('DcGridComponent', () => {
  let component: DcGridComponent;
  let fixture: ComponentFixture<DcGridComponent>;
  let gridServiceSpy: jasmine.SpyObj<GridService>;

  beforeEach(async () => {
    const mockRows = [
      { id: { raw: 1, value: 1 }, name: { raw: 'Alice', value: 'Alice' } }
    ];
    gridServiceSpy = jasmine.createSpyObj('GridService', 
      ['toggleSort', 'addFilter', 'setRows']);
    
    await TestBed.configureTestingModule({
      imports: [DcGridComponent],
      providers: [{ provide: GridService, useValue: gridServiceSpy }]
    }).compileComponents();
  });

  it('should sort on column click', () => {
    component.sortColumn('name');
    expect(gridServiceSpy.toggleSort).toHaveBeenCalledWith('name');
  });
});
```

## Pitfalls & Solutions

| Issue | Solution |
|-------|----------|
| Grid shows wrong row count | Verify `FilteringService` is filtering correctly; check filter conditions |
| Virtual scrolling janky | Ensure container has fixed height; verify `RowHeightService` calculates correct heights |
| Filters not applying | Call `gridService.addFilter()` then manually trigger refresh (GridService auto-emits) |
| Date formatting wrong | Set `gridOptions.displayFormat` with correct timezone from uiStore |
| Column sort order off | Check `SortingService.getSortCondition()` returns correct direction cycle |

## Performance Considerations

- **Virtual Scrolling**: Only renders visible rows (not all 10K rows)
- **Memory**: Stores only row indexes (not full data duplication)
- **API Mode**: Can defer sorting/filtering to backend (see `GridService` apiMode option)
- **Client-Side**: Default mode; all filtering/sorting done in JavaScript

## References

- **Main component**: `projects/open-dcp/angular-grid/src/lib/grid/grid.component.ts`
- **Sub-components**: `projects/open-dcp/angular-grid/src/lib/table/`
- **Core GridService**: `@open-dcp/grid` package
- **Type definitions**: `@open-dcp/grid/types/grid.ts`

