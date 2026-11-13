// src/app/string-filter/string-filter.component.ts
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  computed,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import * as _ from 'underscore';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {FilterDefinition, FilterImplementation, TypesFilterSettings} from "../../models/grid.models";
import {OperatorType} from "@open-dcp/grid";
import {TranslateModule} from "@ngx-translate/core";
import {MatCheckbox} from "@angular/material/checkbox";
import {Subscription} from "rxjs";
import {FilterOperatorService} from "../../services/filter-operator.service";
import {FilterComponentService} from "../../services/filter-component.service";

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
    TranslateModule,
    MatCheckbox,
    ReactiveFormsModule
  ],
  providers: [
    FilterOperatorService
  ],
  templateUrl: './types-filter.component.html',
  styles: ''
})
export class TypesFilterComponent implements FilterImplementation, OnInit, OnDestroy, OnChanges {
  @Input({required: true}) filterSettings!: TypesFilterSettings;
  @Input() triggerClearFilter: boolean = false;
  @Input() columnValue: any = undefined;

  componentId: string = '';

  @Output('clearFilter') clearFilterEmitter = new EventEmitter<void>();
  @Output('applyFilter') applyFilterEmitter = new EventEmitter<void>();

  form = new UntypedFormGroup({});

  subscription = new Subscription();

  constructor(
    private readonly fb: UntypedFormBuilder,
    private filterService: FilterComponentService
  ) {}

  ngOnInit() {
    if (this.filterService) {
      this.componentId = this.filterService.registerComponent(this);
    }
    for (const key in this.filterSettings) {
      if (this.filterSettings[key] !== undefined) {
        this.form.addControl(key, this.fb.control(false));
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['triggerClearFilter'] && changes['triggerClearFilter'].currentValue) {
      this.form.reset();
    }
    if (changes['columnValue'] && changes['columnValue'].currentValue) {
      this.form.patchValue(changes['columnValue'].currentValue);
    }
  }

  ngOnDestroy() {
    if (this.filterService && this.componentId) {
      this.filterService.unregisterComponent(this.componentId);
    }
  }

  /**
   * Use it to build filters for filterService
   * @param value - form value
   */
  buildFilter(value: any): FilterDefinition[] {
    const trueElements = Object.entries(value).filter(([k, v]) => v).map(([k]) => k);

    return [...trueElements].map(key => {
      return ({
        operator: '=',
        value: this.filterSettings[key]
      });
    });
  }

  getFilterDefinition(): FilterDefinition[] {
    return this.buildFilter(this.form.value || []);
  }

  resetFilter(): FilterDefinition[] {
    return [];
  }

  valid() {
    return this.form?.value?.length > -1;
  }
}
