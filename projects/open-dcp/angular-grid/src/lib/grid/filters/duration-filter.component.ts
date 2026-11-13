// src/app/numeric-filter/numeric-filter.component.ts
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
import { CommonModule } from '@angular/common'; // For NgIf, NgFor
import {FormsModule} from '@angular/forms'; // For [(ngModel)]
import {OperatorType} from "@open-dcp/grid";

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon'; // For clearable input icon
import { MatButtonModule } from '@angular/material/button';
import {FilterDefinition, FilterImplementation, TypesFilterSettings} from "../../models/grid.models";
import {FilterOperatorService, OperatorOption} from "../../services/filter-operator.service";
import {TranslateModule} from "@ngx-translate/core";
import { FilterComponentService } from '../../services/filter-component.service';

@Component({
  selector: 'odcp-duration-filter',
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
  templateUrl: './duration-filter.component.html',
  styles: ''
})
export class DurationFilterComponent implements FilterImplementation, OnInit, OnDestroy, OnChanges {
  @Input() filterSettings?: TypesFilterSettings;
  @Input() triggerClearFilter: boolean = false;
  @Input() columnValue: any = undefined;

  // Implements FilterImplementation
  @Output('clearFilter') clearFilterEmitter = new EventEmitter<void>(); //
  @Output('applyFilter') applyFilterEmitter = new EventEmitter<void>(); //

  componentId: string = '';

  // Data properties
  operators: OperatorOption[] = this.filterOperatorService.getFilterOperators('numeric');
  private _operator: OperatorType = '='; // Internal private property
  duration: string = ''; //

  // Operators that do not require a value input
  private noValueOperators: OperatorType[] = [
    'isNull', 'isNotNull', 'empty', 'notEmpty'
  ];

  constructor(
    private readonly filterOperatorService: FilterOperatorService,
        private filterService: FilterComponentService
  ) {}

  // Getter/Setter for operator to react to changes, similar to Vue's watch
  get operator(): OperatorType {
    return this._operator;
  }

  set operator(newOp: OperatorType) {
    this._operator = newOp;
    if (this.noValueOperators.includes(newOp)) { //
      this.duration = ''; //
    }
  }

  // Computed properties as getters
  get showValueInput(): boolean { //
    return !this.noValueOperators.includes(this.operator); //
  }

  // Validate hh:mm:ss format
  validateDuration(val: string): boolean | string { //
    if (!val) return true; //
    return /^(\d{1,2}):([0-5]?\d):([0-5]?\d)$/.test(val) || 'Invalid format (hh:mm:ss)'; //
  }

  // Convert hh:mm:ss to seconds
  parseDuration(val: string): number | null { //
    const match = /^(\d{1,2}):([0-5]?\d):([0-5]?\d)$/.exec(val); //
    if (!match) return null; //
    const [, h, m, s] = match; //
    return Number(h) * 3600 + Number(m) * 60 + Number(s); //
  }

  get isValidDuration(): boolean { //
    return !this.duration || this.validateDuration(this.duration) === true; //
  }

  get durationInSeconds(): number | string { //
    const seconds = this.parseDuration(this.duration); //
    return seconds !== null ? seconds : ''; //
  }

  // Validity getter, exposed by FilterImplementation
  valid = computed<boolean>(() =>{ //
    return this.noValueOperators.includes(this.operator) || (this.isValidDuration && this.duration.trim().length > 0); //
  });

  // Expose methods for FilterImplementation
  getFilterDefinition(): FilterDefinition | null { //
    if (!this.valid) return null; //
    if (this.noValueOperators.includes(this.operator)) { //
      return { operator: this.operator, value: null }; //
    }
    return { //
      operator: this.operator, //
      value: this.parseDuration(this.duration) //
    };
  }

  resetFilter(): void { //
    this.operator = '='; //
    this.duration = ''; //
  }


  ngOnInit() {
    if (this.filterService) {
      this.componentId = this.filterService.registerComponent(this);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['triggerClearFilter'] && changes['triggerClearFilter'].currentValue) {
      this.resetFilter();
    }
    if (changes['columnValue'] && changes['columnValue'].currentValue) {
      this.duration = changes['columnValue'].currentValue;
    }
  }

  ngOnDestroy() {
    if (this.filterService && this.componentId) {
      this.filterService.unregisterComponent(this.componentId);
    }
  }
}
