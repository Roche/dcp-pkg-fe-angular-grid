import {
  Component,
  OnInit,
  computed,
  signal,
  WritableSignal,
  effect,
  OnDestroy,
  SimpleChanges,
  Input, OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { OperatorType } from '@open-dcp/grid';
import {FilterOperatorService} from "../../services/filter-operator.service";
import {MatIconModule} from "@angular/material/icon";
import {FilterDefinition, FilterImplementation, TypesFilterSettings} from "../../models/grid.models";
import {TranslateModule} from "@ngx-translate/core";
import { FilterComponentService } from '../../services/filter-component.service';

@Component({
  selector: 'odcp-date-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  providers: [
    FilterOperatorService
  ],
  templateUrl: './date-filter.component.html',
  styles: ``
})
export class DateFilterComponent implements OnInit, FilterImplementation, OnDestroy, OnChanges {
  @Input() filterSettings?: TypesFilterSettings;
  @Input() triggerClearFilter: boolean = false;
  @Input() columnValue: any = undefined;

  componentId: string = '';

  // Reactive Forms Controls
  operatorControl = new FormControl<OperatorType>('=');
  singleDateControl = new FormControl<string | null>(null);
  rangeStartControl = new FormControl<string | null>(null);
  rangeEndControl = new FormControl<string | null>(null);

  // Data from service (mimicking useFilterOperatorList)
  operators = this.filterOperatorService.getFilterOperators('date');

  // Constants (mimicking ref and computed from Vue)
  noValueOperators: OperatorType[] = ['isNull', 'isNotNull', 'empty', 'notEmpty'];
  rangeOperators: OperatorType[] = ['between', 'notBetween'];

  operator: WritableSignal<OperatorType> = signal(this.operatorControl.value || '=');

  showSingleInput = computed(() =>
    !this.noValueOperators.includes(this.operator()) && !this.rangeOperators.includes(this.operator())
  );

  showRangeInput = computed(() =>
    this.rangeOperators.includes(this.operator())
  );

  // Mimicking 'valid' computed property from Vue
  valid = computed<boolean>(() => {
    const currentOperator = this.operator();

    if (this.noValueOperators.includes(currentOperator)) {
      return true;
    }

    if (this.rangeOperators.includes(currentOperator)) {
      // Check if both start and end dates are selected for range
      return !!this.rangeStartControl.value && !!this.rangeEndControl.value;
    }

    // For single date input
    return !!this.singleDateControl.value;
  });

  constructor(private filterOperatorService: FilterOperatorService,
      private filterService: FilterComponentService) {
    effect(() => {
      this.operator.set(this.operatorControl.value || '=');
    });

    // Mimicking Vue's watch(operator, (newOp) => { ... })
    effect(() => {
      const newOp = this.operator();

      if (this.noValueOperators.includes(newOp)) {
        this.singleDateControl.setValue(null);
        this.rangeStartControl.setValue(null);
        this.rangeEndControl.setValue(null);
      } else if (this.rangeOperators.includes(newOp)) {
        this.singleDateControl.setValue(null);
      } else {
        this.rangeStartControl.setValue(null);
        this.rangeEndControl.setValue(null);
      }
    });
  }

  // Implementation of FilterImplementation interface
  getFilterDefinition(): FilterDefinition | null {
    if (!this.valid()) return null;

    const currentOperator = this.operator();

    if (this.rangeOperators.includes(currentOperator)) {
      return {
        operator: currentOperator,
        value: [this.rangeStartControl.value, this.rangeEndControl.value]
      };
    }
    if (this.noValueOperators.includes(currentOperator)) {
      return { operator: currentOperator, value: null };
    }
    return {
      operator: currentOperator,
      value: this.singleDateControl.value
    };
  }

  resetFilter(): void {
    this.operatorControl.setValue('=');
    this.singleDateControl.setValue(null);
    this.rangeStartControl.setValue(null);
    this.rangeEndControl.setValue(null);
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
  }

  ngOnDestroy() {
    if (this.filterService && this.componentId) {
      this.filterService.unregisterComponent(this.componentId);
    }
  }
}
