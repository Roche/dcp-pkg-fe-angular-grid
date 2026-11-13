import {
  Component,
  Input,
  OnChanges,
  OnInit,
  AfterViewInit,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ElementRef,
  computed, WritableSignal, signal,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon'; // Needed for sort icons in HeaderCell, good to have if any icons are added here.

// Import converted sub-components
import { HeaderCellComponent } from '../header-cell/header-cell.component';
import { BodyCellComponent } from '../body-cell/body-cell.component'; // Assuming BodyCell conversion

// Import services and types (these would be in your shared/types/services folders)
import {Subject} from 'rxjs';
import {BodyCellSpecialValues, GridColumn} from "../../models/grid.models";
import {DisplayFormat, FilterCondition, FilterGroup, GridOptions, GridService, RenderRow, SortingCondition} from "@open-dcp/grid";
import {takeUntil} from "rxjs/operators";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'odcp-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    HeaderCellComponent,
    BodyCellComponent,
    TranslateModule,
  ],
  templateUrl: './grid.component.html',
  styles: [
    `.clear-button {
      border-radius: 50% !important;
      width: 24px !important;
      height: 24px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 !important;

      .mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        line-height: 16px;
      }
    }`
  ]
})
export class DcpTableComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input({ required: true }) rows!: Record<string, any>[];
  @Input({ required: true }) columns!: GridColumn[];
  @Input() apiMode: boolean = false;
  @Input() displayFormat: Partial<DisplayFormat> = {};
  @Input() elementHeight: number = 41;
  @Input() filter: FilterCondition[] = [];
  @Input() sort: SortingCondition[] = [];
  @Input() select: Set<number> = new Set();
  @Input() selectable: boolean = false;
  @Input() sortable: boolean = false;
  @Input() filterable: boolean = false;
  @Input() advancedFilter: boolean = false;
  @Input() globalSearch: boolean = false;
  @Input() caseInsensitiveFiltering: boolean = false;
  @Input() stickyHeader: boolean = false;
  @Input() height?: number;
  @Input() specialDisplayValues: BodyCellSpecialValues = {
    'null': 'N/A',
    'undefined': 'N/A'
  };
  @Input() downloadCsv = false;
  @Output() downloadCsvClick?: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('tableContainer') tableContainer!: ElementRef<HTMLDivElement>;

  // Reactive properties for virtual scrolling and rendering
  firstRowHeight: number = 0;
  lastRowHeight: number = 0;
  startIndex: number = 0;
  renderRows: RenderRow[] = [];
  selectedIndexes: Set<number> = new Set();

  // GridService instance (can also be injected if it's a singleton in your app)
  gridService!: GridService;

  destroy$ = new Subject();

  heightSignal: WritableSignal<number | undefined> = signal(this.height);
  // Computed properties (Angular signals or simple getters)
  readonly computedStyle = computed(() => {
    return {
      height: this.heightSignal() ? `${this.heightSignal()}px` : undefined
    };
  });

  readonly stickyHeaderStyle = computed(() => {
    if (!this.stickyHeader) {
      return '';
    }
    return 'position: sticky; background-color: #fff; top: 0; z-index: 1;';
  });

  readonly someSelected = computed(() =>
    this.rows.length > this.selectedIndexes.size && this.selectedIndexes.size > 0
  );

  readonly allSelected = computed(() =>
    this.selectedIndexes.size === this.rows.length && this.rows.length > 0
  );

  searchQuery: string = '';

  constructor(private readonly translate: TranslateService) {
    // Initialize GridService here, or inject if it's an application-wide singleton.
    // Ensure all props needed for GridService constructor are available.
    // For simplicity, instantiating here as in Vue example.
    translate.setTranslation('en', {
      odcp: {
        search: "Search"
      }
    }, true);
    translate.setTranslation('de', {
      odcp: {
        search: "Search"
      }
    }, true);
  }

  ngOnInit(): void {
    const gridOptions: GridOptions = {
      elementHeight: this.elementHeight,
      displayFormat: this.displayFormat,
      allSelector: true,
      multiSelect: true,
      caseInsensitiveFiltering: this.caseInsensitiveFiltering
    };

    let filterToApply: FilterGroup | null = null;
    if (this.filter.length > 0) {
      filterToApply = {
          type: 'group',
          operator: 'or',
          filters: this.filter
      };
    }
    this.gridService = new GridService(this.rows, this.columns, gridOptions, this.sort, filterToApply, this.select);

    if (this.apiMode) {
      this.gridService.enableApiMode();
    }
    // Initial subscriptions (could also be in ngAfterViewInit if DOM element needed for GridService initialization)
    this.gridService.getState().pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.renderRows = state.renderRows;
      this.firstRowHeight = state.firstRowHeight;
      this.lastRowHeight = state.lastRowHeight;
      this.startIndex = state.startIndex;
    });

    this.gridService.getSelected().pipe(takeUntil(this.destroy$)).subscribe((selectedRows) => {
      this.selectedIndexes = new Set(selectedRows);
    });

    this.gridService.filterSort$.pipe(takeUntil(this.destroy$)).subscribe(({ filterTree, sorts }) => {
      if (this.apiMode) {
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['displayFormat'] && !changes['displayFormat'].firstChange) {
      this.gridService.updateDisplayFormat(this.displayFormat);
    }
    if (changes['rows'] && !changes['rows'].firstChange) {
      this.gridService.setRows(this.rows);
      this.gridService.updateRenderedRows();
    }
    if (changes['columns'] && !changes['columns'].firstChange) {
      this.gridService.setColumns(this.columns);
    }
    if (changes['height']) {
      this.heightSignal.set(this.height);
    }
  }

  ngAfterViewInit(): void {
    if (this.tableContainer) {
      this.gridService.attachContainer(this.tableContainer.nativeElement);
      this.tableContainer.nativeElement.addEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(false);
    this.destroy$.complete();
    if (this.tableContainer) {
      this.tableContainer.nativeElement.removeEventListener('scroll', this.handleScroll.bind(this));
    }
  }

// Event handler for scrolling
  handleScroll(event: Event): void {
    this.gridService.handleScroll(event);
  }

  toggleSelection(index: number): void {
    this.gridService.toggleRowSelection(index);
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.gridService.clearSelection();
    } else {
      this.gridService.selectAll();
    }
  }

  handleDownloadCsv() {
    this.downloadCsvClick?.emit();
  }

  onGlobalSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.applyGlobalSearch(value);
  }

  applyGlobalSearch(value: string) {
    if (!this.gridService) {
      return;
    }

    const query = value ? value.trim() : "";

    if (!query) {
      this.searchQuery = "";
      this.gridService.clearGlobalSearch();
      return;
    }

    this.searchQuery = query;
    this.gridService.setGlobalSearch(query, {
      caseInsensitive: true,
      searchMode: "display",
    });
  };


  clearGlobalSearch(input: HTMLInputElement) {
    input.value = '';
    this.searchQuery = '';
    this.applyGlobalSearch('');
  }
}
