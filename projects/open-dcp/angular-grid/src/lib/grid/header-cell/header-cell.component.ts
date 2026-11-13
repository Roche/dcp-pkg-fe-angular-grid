import {Component, Input, AfterViewInit, OnDestroy, ElementRef, Renderer2} from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngIf, ngClass
import { MatIconModule } from '@angular/material/icon'; // For Material Icons
import { MatButtonModule } from '@angular/material/button'; // If you want the label to be a Material button

// Assuming these are defined elsewhere in your Angular project
import { HeaderCellFilterComponent } from '../header-cell-filter/header-cell-filter.component';
import {FilterCondition, FilterGroup, GridService} from "@open-dcp/grid";
import {GridColumn} from "../../models/grid.models";
import {RemoveHost} from "@open-dcp/angular-services";
import {TranslateModule} from "@ngx-translate/core";


@Component({
  selector: 'odcp-header-cell',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule, // Optional, depending on desired styling
    HeaderCellFilterComponent,
    TranslateModule
  ],
  templateUrl: './header-cell.component.html',
  styleUrls: []
})
export class HeaderCellComponent extends RemoveHost implements AfterViewInit, OnDestroy {
  @Input({ required: true }) gridService!: GridService;
  @Input({ required: true }) column!: GridColumn;
  @Input() filterable: boolean = false;
  @Input() advancedFilter: boolean = false;
  @Input() sortable: boolean = false;
  @Input() sortDirection?: 'asc' | 'desc';
  @Input({ required: true }) isFiltered!: boolean;

  // No explicit outputs are needed for sorting/filtering in this component,
  // as the GridService handles the state changes directly.
  // If the HeaderCellFilterComponent needs to emit events, it would have outputs.

  constructor(
    _elRef: ElementRef,
    _renderer: Renderer2
  ) {
    super(_elRef, _renderer);
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }


  toggleSortByColumn(): void {
    if (!this.sortable) {
      return;
    }
    this.gridService.toggleSort(this.column.key);
  }

  updateFilter(filterCondition: FilterCondition | FilterGroup): void {
    this.gridService.addFilter(filterCondition);
  }

  resetFilter(): void {
    this.gridService.resetFilter(this.column.key);
  }
}
