// src/app/date-time-filter/date-time-filter.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  inject,
  ViewChild,
  computed,
  Input,
  SimpleChanges, OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common'; // For NgIf, NgFor
import { FormsModule } from '@angular/forms'; // For [(ngModel)]
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // For datepicker
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button'; // If you want a button to trigger the time picker

import { Subject } from 'rxjs';
import {FilterDefinition, FilterImplementation, TypesFilterSettings} from "../../models/grid.models";
import {OperatorType} from "@open-dcp/grid";
import {FilterOperatorService} from "../../services/filter-operator.service";
import {MatIconModule} from "@angular/material/icon";
import {TranslateModule} from "@ngx-translate/core";
import { FilterComponentService } from '../../services/filter-component.service';


@Component({
  selector: 'odcp-date-time-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatButtonModule,
    TranslateModule
  ],
  providers: [
    FilterOperatorService
  ],
  templateUrl: './date-time-filter.component.html',
  styles: ''
})
export class DateTimeFilterComponent implements OnInit, OnDestroy, FilterImplementation, OnChanges {
  @Input() filterSettings?: TypesFilterSettings;
  @Input() triggerClearFilter: boolean = false;
  @Input() columnValue: any = undefined;

  // Implements FilterImplementation
  @Output('clearFilter') clearFilterEmitter = new EventEmitter<void>(); //
  @Output('applyFilter') applyFilterEmitter = new EventEmitter<void>(); //

  // ViewChild for programmatic closing of time pickers
  @ViewChild('menuTimeTrigger', { read: MatMenuTrigger }) menuTimeTrigger!: MatMenuTrigger;
  @ViewChild('menuStartTimeTrigger', { read: MatMenuTrigger }) menuStartTimeTrigger!: MatMenuTrigger;
  @ViewChild('menuEndTimeTrigger', { read: MatMenuTrigger }) menuEndTimeTrigger!: MatMenuTrigger;


  componentId: string = '';

  // Data properties
  operators = this.filterOperatorService.getFilterOperators('date');
  operator: OperatorType = '='; //

  // Single value properties
  date: Date | null = null; // Changed to Date object for mat-datepicker
  time: string | null = null; // e.g., "14:30"

  // Range values properties
  rangeStartDate: Date | null = null; // Changed to Date object
  rangeStartTime: string | null = null;
  rangeEndDate: Date | null = null; // Changed to Date object
  rangeEndTime: string | null = null;

  // Constants for operator types
  private noValueOperators: OperatorType[] = ['isNull', 'isNotNull', 'empty', 'notEmpty']; //
  private rangeOperators: OperatorType[] = ['between', 'notBetween']; //

  private destroy$ = new Subject(); // For managing subscriptions

  constructor(
    private readonly filterOperatorService: FilterOperatorService,
        private filterService: FilterComponentService
  ) {
    // In Angular, component initialization can happen here or in ngOnInit
  }

  // Setter for operator to react to changes
  set operatorValue(newOp: OperatorType) {
    this.operator = newOp;
    if (this.noValueOperators.includes(newOp)) { //
      this.date = null; //
      this.time = null; //
      this.rangeStartDate = null; //
      this.rangeStartTime = null; //
      this.rangeEndDate = null; //
      this.rangeEndTime = null; //
    } else if (this.rangeOperators.includes(newOp)) { //
      this.date = null; //
      this.time = null; //
    } else { //
      this.rangeStartDate = null; //
      this.rangeStartTime = null; //
      this.rangeEndDate = null; //
      this.rangeEndTime = null; //
    }
  }
  get operatorValue(): OperatorType {
    return this.operator;
  }

  // Computed properties as getters
  get showSingleInput(): boolean { //
    return !this.noValueOperators.includes(this.operator) && !this.rangeOperators.includes(this.operator); //
  }

  get showRangeInput(): boolean { //
    return this.rangeOperators.includes(this.operator); //
  }

  // Combined Date-Time utility function
  private combineDateTime(date: Date | null, time: string | null): string | null { //
    if (!date) return null; //

    const dateStr = date.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
    if (!time) return `${dateStr}T00:00:00`; //

    // Ensure time is in HH:mm:ss format, assuming input is HH:mm
    const formattedTime = time.length === 5 ? `${time}:00` : time; //
    return `${dateStr}T${formattedTime}`; //
  }

  valid = computed<boolean>(() =>{ //
    if (this.noValueOperators.includes(this.operator)) return true; //
    if (this.rangeOperators.includes(this.operator)) { //
      return !!this.rangeStartDate && !!this.rangeEndDate; //
    }
    return !!this.date; //
  })

  // Expose methods and properties for FilterImplementation
  getFilterDefinition(): FilterDefinition | null { //
    if (!this.valid) return null; //

    if (this.rangeOperators.includes(this.operator)) { //
      return { //
        operator: this.operator, //
        value: [ //
          this.combineDateTime(this.rangeStartDate, this.rangeStartTime), //
          this.combineDateTime(this.rangeEndDate, this.rangeEndTime) //
        ] //
      }; //
    }
    if (this.noValueOperators.includes(this.operator)) { //
      return { operator: this.operator, value: null }; //
    }
    return { //
      operator: this.operator, //
      value: this.combineDateTime(this.date, this.time) //
    }; //
  }

  resetFilter(): void { //
    this.operator = '='; //
    this.date = null; //
    this.time = null; //
    this.rangeStartDate = null; //
    this.rangeStartTime = null; //
    this.rangeEndDate = null; //
    this.rangeEndTime = null; //
  }

  // Helper to handle time picker selection
  onTimeSelected(selectedTime: string | null, pickerType: 'single' | 'start' | 'end'): void {
    if (pickerType === 'single') {
      this.time = selectedTime;
      this.menuTimeTrigger.closeMenu();
    } else if (pickerType === 'start') {
      this.rangeStartTime = selectedTime;
      this.menuStartTimeTrigger.closeMenu();
    } else if (pickerType === 'end') {
      this.rangeEndTime = selectedTime;
      this.menuEndTimeTrigger.closeMenu();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(false);
    this.destroy$.complete();
     if (this.filterService && this.componentId) {
      this.filterService.unregisterComponent(this.componentId);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['triggerClearFilter'] && changes['triggerClearFilter'].currentValue) {
      this.resetFilter();
    }
  }


  ngOnInit() {
    if (this.filterService) {
      this.componentId = this.filterService.registerComponent(this);
    }
  }
}
