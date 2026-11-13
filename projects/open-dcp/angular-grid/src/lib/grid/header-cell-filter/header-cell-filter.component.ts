// header-cell-filter.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ColumnType, FilterCondition, FilterGroup, FilterNode, GridService, OperatorType} from "@open-dcp/grid";
import {DateFilterComponent} from "../filters/date-filter.component";
import {DateTimeFilterComponent} from "../filters/date-time-filter.component";
import { StringFilterComponent } from '../filters/string-filter.component';
import { NumericFilterComponent } from '../filters/numeric-filter.component';
import { FilterComponentService } from '../../services/filter-component.service';
import {FilterDefinition, filterSettingsTypes, filterTypes} from "../../models/grid.models";
import {TypesFilterComponent} from "../filters/types-filter.component";
import {BehaviorSubject, Subject, takeUntil} from "rxjs";
import {TextButtonComponent} from "@open-dcp/angular-basic-components";
import { MatSelectModule } from '@angular/material/select';

export type GroupOperatorType = 'and' | 'or';

@Component({
  selector: 'odcp-header-cell-filter',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    TextButtonComponent
  ],
  template: `
    <button mat-icon-button class="small-icon-btn" [matMenuTriggerFor]="filterMenu" aria-label="Filter column" #menuTrigger="matMenuTrigger">
      <mat-icon [color]="isFiltered ? 'primary' : ''">filter_alt</mat-icon>
    </button>
    <mat-menu #filterMenu="matMenu">
      <div class="odcp-grid_filter" (click)="$event.stopPropagation()">
        <ng-container *ngComponentOutlet="getFilterComponent(); inputs getFilterInputs()" #filterComponent />
        <div *ngIf="advancedFilter">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Combine filters with</mat-label>
            <mat-select [formControl]="operatorControl">
              <mat-option [value]="'and'">And</mat-option>
              <mat-option [value]="'or'">Or</mat-option>
            </mat-select>
          </mat-form-field>
          <ng-container *ngComponentOutlet="getFilterComponent(); inputs getFilterInputs()" #secondFilterComponent />
        </div>
        <div class="odcp-grid_filter_actions">
          <odcp-text-button (click)="clearFilter(); menuTrigger.closeMenu()" [color]="undefined">
            Clear
          </odcp-text-button>
          <odcp-text-button color="primary"
                            (click)="applyFilter(); menuTrigger.closeMenu()" >
            Apply
          </odcp-text-button>
        </div>
      </div>
    </mat-menu>
  `,
  providers: [FilterComponentService],
  styleUrls: []
})
export class HeaderCellFilterComponent implements OnInit, OnDestroy {
  @Input({ required: true }) isFiltered!: boolean;
  @Input({ required: true }) columnType!: ColumnType;
  @Input({ required: true }) columnKey!: string | number;
  @Input({ required: true }) gridService!: GridService;
    

  @Input() filterType!: undefined | filterTypes;
  @Input() filterSettings!: undefined | filterSettingsTypes;
  @Input() defaultOperator: OperatorType = '=';
  @Input() advancedFilter: boolean = false;

  @Output() updateFilter = new EventEmitter<FilterCondition | FilterGroup>();
  @Output() resetFilter = new EventEmitter<void>();

  triggerClearFilter = new BehaviorSubject<boolean>(false);

  destroy$ = new Subject();
  columnValue: any = undefined;

  operatorControl = new FormControl<GroupOperatorType>('or', {nonNullable: true});

 constructor(private filterService: FilterComponentService) {}

  ngOnInit(): void {
    this.gridService.filterSort$.pipe(takeUntil(this.destroy$)).subscribe(({filterTree}) => {
      this.columnValue = filterTree ? this.getValueByColumn(filterTree) : undefined;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(false);
    this.destroy$.complete();
  }

  getValueByColumn(filter: FilterNode): any {
    if (filter.type === "condition") {
      return filter.columnKey === this.columnKey ? filter.value : undefined;
    }
    if (filter.type === "group" && Array.isArray(filter.filters)) {
      for (const childFilter of filter.filters) {
        const result = this.getValueByColumn(childFilter);
        if (result !== undefined) return result;
      }
    }
    return undefined;
  }

  applyFilter(): void {
    const filterValues = this.filterService.getFilterDefinitions();
  
    if (filterValues.length === 0) {
      return;
    }
    
    if (filterValues.length === 1) {
      this.addFilterCondition(filterValues[0] as FilterDefinition);
    }
    
    this.addFilterGroup(filterValues as FilterDefinition[]);
  }

  addFilterCondition(filterValue: FilterDefinition) {
    const condition: FilterCondition = {
      type: 'condition',
      columnKey: this.columnKey as string,
      value: filterValue.value,
      operator: filterValue.operator,
    };
    this.updateFilter.emit(condition);
  }

  addFilterGroup(filterValue: FilterDefinition[]) {

    let filters: FilterNode[] = [];
    (filterValue as FilterDefinition[]).forEach((filterDefinition: FilterDefinition) => {
      filters.push({
        type: 'condition',
        columnKey: this.columnKey as string,
        operator: filterDefinition.operator,
        value: filterDefinition.value
      })
    });
    const condition: FilterGroup = {
      type: 'group',
      filters: filters,
      operator: this.operatorControl.value
    };
    this.updateFilter.emit(condition as FilterGroup);
  }

  clearFilter(): void {
    this.resetFilter.emit();
    this.triggerClearFilter.next(true);
    setTimeout(() => {
      this.triggerClearFilter.next(false);
    });
  }

  getFilterComponent(): any {
    if (this.filterType) {
      switch (this.filterType) {
        case "date":
          return DateFilterComponent;
        case "datetime":
          return DateTimeFilterComponent;
        case "integer":
          return NumericFilterComponent;
        case "types":
          return TypesFilterComponent;
        default:
          return StringFilterComponent
      }
    }
    switch (this.columnType) {
      case "date":
        return DateFilterComponent;
      case "datetime":
        return DateTimeFilterComponent;
      case "integer":
        return NumericFilterComponent;
      default:
        return StringFilterComponent;
    }
  }

  private getOperatorForType(type: string): OperatorType {
    // This is a placeholder. You'd have logic here to determine the default
    // operator based on the column type (e.g., 'contains' for string, 'equals' for number).
    switch (type) {
      case 'string':
        return 'contains';
      case 'number':
        return '=';
      // ... other types
      default:
        return '=';
    }
  }

  getFilterInputs() {
    if (!this.filterType) {
      return {
        triggerClearFilter: this.triggerClearFilter.value,
        defaultOperator: this.defaultOperator,
        columnValue: this.columnValue,
      };
    }
    return {
      filterSettings: this.filterSettings,
      triggerClearFilter: this.triggerClearFilter.value,
      defaultOperator: this.defaultOperator,
      columnValue: this.columnValue
    }
  }
}
