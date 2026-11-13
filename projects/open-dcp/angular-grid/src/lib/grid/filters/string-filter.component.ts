// src/app/string-filter/string-filter.component.ts
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  computed,
  OnDestroy,
  OnChanges,
  Input,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {FilterDefinition, FilterImplementation, TypesFilterSettings} from "../../models/grid.models";
import {FilterOperatorService, OperatorOption} from "../../services/filter-operator.service";
import {OperatorType} from "@open-dcp/grid";
import {TranslateModule} from "@ngx-translate/core";
import { FilterComponentService } from '../../services/filter-component.service';

@Component({
  selector: 'odcp-string-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule
  ],
  providers: [
    FilterOperatorService
  ],
  templateUrl: './string-filter.component.html',
  styles: ''
})
export class StringFilterComponent implements FilterImplementation, OnInit, OnDestroy, OnChanges {
  @Input() filterSettings?: TypesFilterSettings;
  @Input() triggerClearFilter: boolean = false;
  @Input() defaultOperator: OperatorType = '=';
  @Input() columnValue: any = undefined;

  @Output('clearFilter') clearFilterEmitter = new EventEmitter<void>();
  @Output('applyFilter') applyFilterEmitter = new EventEmitter<void>();

  componentId: string = '';

  // Data properties, equivalent to Vue's `ref` variables
  operators: OperatorOption[] = this.filterOperatorService.getFilterOperators('string');
  private _operator: OperatorType = this.defaultOperator; // Internal private property for operator
  value: string = '';

  // Operators that do not require a value input
  private noValueOperators: OperatorType[] = [
    'isNull', 'isNotNull', 'empty', 'notEmpty'
  ];


  constructor(
    private readonly filterOperatorService: FilterOperatorService,
    private filterService: FilterComponentService
  ) {}

  // Getter/Setter for operator to react to changes, similar to Vue's `watch`
  get operator(): OperatorType {
    return this._operator;
  }

  set operator(newOp: OperatorType) {
    this._operator = newOp;
    // Reset value if operator changes to one that doesn't need a value
    if (this.noValueOperators.includes(newOp)) {
      this.value = '';
    }
  }

  // Computed property as a getter for `showValueInput`
  get showValueInput(): boolean {
    return !this.noValueOperators.includes(this.operator);
  }

  // Validity getter, equivalent to Vue's `valid` computed property
  // Exposed by the `FilterImplementation` interface
  valid = computed<boolean>(() => {
    // Valid if value is set or operator does not require a value
    return this.noValueOperators.includes(this.operator) || this.value.trim().length > 0;
  });

  // Exposed method for `getFilterDefinition`
  getFilterDefinition(): FilterDefinition | null {
    if (!this.valid) {
      return null;
    }
    return {
      operator: this.operator,
      value: this.value
    };
  }

  // Exposed method for `resetFilter`
  resetFilter(): void {
    this.operator = this.defaultOperator;
    this.value = "";
  }

  ngOnInit() {
    this.operator = this.defaultOperator;
    if (this.filterService) {
      this.componentId = this.filterService.registerComponent(this);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['triggerClearFilter'] && changes['triggerClearFilter'].currentValue) {
      this.resetFilter();
    }
    if (changes['columnValue'] && changes['columnValue'].currentValue) {
      this.value = changes['columnValue'].currentValue;
    }
  }

  ngOnDestroy() {
    if (this.filterService && this.componentId) {
      this.filterService.unregisterComponent(this.componentId);
    }
  }
}
