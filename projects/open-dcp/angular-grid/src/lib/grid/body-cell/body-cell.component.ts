import {
  Component,
  Input,
  computed,
  Type,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges, ElementRef, Renderer2, ViewChildren, QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {BodyCellSpecialValues, GridColumn} from "../../models/grid.models";
import {Row} from "@open-dcp/grid";
import {RemoveHost} from "@open-dcp/angular-services";

@Component({
  selector: 'odcp-body-cell',
  standalone: true, // Indicates this is a standalone component in Angular 17+
  imports: [
    CommonModule // Import CommonModule for directives
  ],
  template: `
    <td [style]="column.style">
      <ng-container *ngIf="column.component; else noCustomComponent">
        <ng-container #dynamicComponentHost></ng-container>
      </ng-container>

      <ng-template #noCustomComponent>
        <ng-container *ngIf="isRenderedElementValid(); else notRenderedElementValid">
          <span [innerHTML]="row[column.key]?.renderedElement?.innerHTML"></span>
        </ng-container>
        <ng-template #notRenderedElementValid>
          <ng-container *ngIf="column.displayAsHtml; else defaultDisplay">
            <span [innerHTML]="row[column.key]?.display"></span>
          </ng-container>
          <ng-template #defaultDisplay>
            <span [innerHTML]="displayCell()"></span>
          </ng-template>
        </ng-template>
      </ng-template>
    </td>
  `,
  styles: [`
    .text-muted {
      color: #6c757d; /* Example muted text color */
    }
  `]
})
export class BodyCellComponent extends RemoveHost implements AfterViewInit, OnChanges, OnDestroy {
  // @Input decorators replace Vue's defineProps for receiving data
  @Input({ required: true }) column!: GridColumn;
  @Input({ required: true }) row!: Row;
  @Input({ required: true }) specialDisplayValues!: BodyCellSpecialValues;

  // ViewChild to get a reference to the host element for dynamic component creation
  @ViewChildren('dynamicComponentHost', { read: ViewContainerRef }) dynamicComponentHost!: QueryList<ViewContainerRef>;

  // Angular Signals for computed properties, replacing Vue's computed()
  readonly isRenderedElementValid = computed(() => {
    const renderedElement = this.row[this.column.key]?.renderedElement;
    return renderedElement && typeof renderedElement === 'object';
  });

  // This computed property is from the Vue source.
  // In Angular, if 'renderedElement' contains attributes for an element,
  // those would typically be bound directly using [attr.name] or [property].
  // If it's for inline styles, [ngStyle] is used.
  // The 'v-bind="normalizedRenderedElement"' in Vue often implies spreading attributes/styles.
  // For `span v-bind="object"` where object has arbitrary keys and values, Angular needs a custom directive.
  // Here, I'm assuming 'renderedElement' provides innerHTML or is for dynamic component mapping.
  // If `renderedElement` is truly meant to supply dynamic attributes to the `<span>`,
  // the `[innerHTML]` might not be sufficient and a custom directive is needed.
  readonly normalizedRenderedElement = computed(() => {
    const renderedElement = this.row[this.column.key]?.renderedElement;

    if (!renderedElement || typeof renderedElement !== 'object') {
      return {};
    }

    // Normalize the style property if it exists
    const { style, ...rest } = renderedElement;
    if (style instanceof CSSStyleDeclaration) {
      const normalizedStyle: Record<string, string> = Array.from(style).reduce((styleObj: Record<string, string>, key: string) => {
        styleObj[key] = style.getPropertyValue(key); //
        return styleObj;
      }, {} as Record<string, string>);
      return { ...rest, style: normalizedStyle };
    }

    return renderedElement;
  });

  // Angular Signal for displayCell, replacing Vue's computed()
  readonly displayCell = computed(() => {
    const displayValue = this.row[this.column.key]?.display; // Access 'display' property as per source

    if (displayValue === undefined) {
      return `<span class="text-muted">${this.specialDisplayValues['undefined']}</span>`;
    }
    if (displayValue === null) {
      return `<span class="text-muted">${this.specialDisplayValues['null']}</span>`;
    }

    return displayValue;
  });

  constructor(
    _elRef: ElementRef,
    _renderer: Renderer2
  ) {
    super(_elRef, _renderer);
  }

  // Lifecycle hook for initial view setup, similar to Vue's onMounted
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.loadDynamicComponent();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  // Lifecycle hook to react to input changes, similar to Vue's watch/watchEffect on props
  ngOnChanges(changes: SimpleChanges): void {
    // Reload dynamic component if column or row data changes
    if (changes['column'] || changes['row']) {
      if (!this.dynamicComponentHost) {
        return;
      }
      this.loadDynamicComponent();
    }
  }

  private loadDynamicComponent(): void {
    if (this.column.component) {
      if (!this.dynamicComponentHost || !this.dynamicComponentHost.first) {
        return;
      }
      this.dynamicComponentHost.first?.clear(); // Clear any existing component
      const componentRef = this.dynamicComponentHost.first?.createComponent(this.column.component as Type<any>);

      // Map props to the dynamic component's inputs
      if (this.column.componentPropsMapper) {
        // Use the mapper function if provided, similar to Vue's v-bind with function
        const propsToBind = this.column.componentPropsMapper(this.row[this.column.key], this.row);
        for (const key in propsToBind) {
          if (Object.prototype.hasOwnProperty.call(propsToBind, key)) {
            // Set input property on the dynamically created component instance
            (componentRef.instance as any)[key] = propsToBind[key];
          }
        }
      } else {
        // Default binding if no mapper is provided, similar to Vue's :value="row[column.key]" :row="row"
        (componentRef.instance as any)['value'] = this.row[this.column.key];
        (componentRef.instance as any)['row'] = this.row;
      }

      // Detect changes for the dynamically created component
      componentRef.changeDetectorRef.detectChanges();
    }
  }
}
