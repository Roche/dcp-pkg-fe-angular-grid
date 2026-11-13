import {applicationConfig, Meta, moduleMetadata, StoryFn, StoryObj} from '@storybook/angular';
import {provideAnimations} from "@angular/platform-browser/animations";
import {DcpTableComponent} from "../../lib/grid/grid/grid.component";
import {generateMockRows, mockColumns, mockColumnsWithCustomComponent, mockColumnsWithTypeFilter} from "./mockData";
import {TranslateModule} from "@ngx-translate/core";
import { action } from '@storybook/addon-actions';

import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatMenuModule} from "@angular/material/menu";
import {ThreeDotsMenuComponent} from "@open-dcp/angular-basic-components";
import {GridColumn} from "../../lib/models/grid.models";

/**
 * Three dots menu component
 */
@Component({
  selector: 'odcp-three-dots-grid-demo',
  standalone: true,
  imports: [CommonModule, MatMenuModule, ThreeDotsMenuComponent],
  template: `
    <odcp-three-dots-menu
      [disabled]="disabled">
      <button mat-menu-item (click)="edit()">
        Edit
      </button>
      <button mat-menu-item (click)="delete()">
        Delete
      </button>
    </odcp-three-dots-menu>`,
  styles: ['.top-element {z-index: 5;}']
})
export class ThreeDotsGridDemoComponent {
  @Input() row!: any;
  @Input() disabled: boolean = false;


  edit() {
    console.log('edit', this.row);
  }

  delete() {
    console.log('delete', this.row);
  }
}

@Component({
  selector: 'odcp-dynamic-column-demo',
  standalone: true,
  imports: [CommonModule, DcpTableComponent],
  template: `
    <div style="width: 100%">
      <div style="margin-bottom: 12px; padding: 8px; background: #f0f0f0; border-radius: 4px;">
        {{ statusMessage }}
      </div>
      <odcp-grid style="width: 100%" [rows]="rows" [columns]="columns"></odcp-grid>
    </div>
  `,
})
export class DynamicColumnDemoComponent implements OnInit {
  @Input() rows: any[] = [];

  columns: GridColumn[] = [
    { key: 'id', label: 'ID', width: '10%', type: 'integer' },
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'age', label: 'Age', width: '20%', type: 'number' },
    { key: 'country', label: 'Country', width: '40%', type: 'string' },
  ];

  statusMessage = '⏳ Columns will update in 2 seconds...';

  ngOnInit(): void {
    setTimeout(() => {
      this.columns = [
        { key: 'id', label: 'ID (Updated)', width: '15%', type: 'integer' },
        { key: 'name', label: 'Full Name (Updated)', width: '45%', type: 'string' },
        { key: 'country', label: 'Country (Updated)', width: '40%', type: 'string' },
      ];
      this.statusMessage = '✅ Columns updated after 2 seconds!';
    }, 2000);
  }
}


const meta: Meta<DcpTableComponent> = {
  title: 'Grid/DataGrid',
  component: DcpTableComponent,
  decorators: [
    moduleMetadata({
      imports: [MatMenuModule, TranslateModule.forRoot({
        defaultLanguage: 'en'
      }), ThreeDotsGridDemoComponent],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  tags: ['autodocs'],
  args: {
    rows: [],
    columns: []
  },
  argTypes: {
    selectable: {
      type: 'boolean'
    },
    sortable: {
      type: 'boolean'
    },
    filterable: {
      type: 'boolean'
    },
    advancedFilter: {
      type: 'boolean'
    },
    stickyHeader: {
      type: 'boolean'
    },
    elementHeight: {
      type: 'number'
    },
    height: {
      type: 'number'
    },
    rows: {
      control: "object"
    },
    columns: {
      control: "object"
    }
  }
};

export default meta;
type Story = StoryObj<DcpTableComponent>;

export const BasicUsage: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `
<div style="width: 100%">
      <odcp-grid style="width: 100%"
      [rows]="rows"
      [columns]="columns"></odcp-grid>
</div>
    `
  }),
  args: {
    rows: generateMockRows(100),
    columns: [
      ...mockColumns,
      {
        key: "actions",
        label: "Actions",
        type: "component",
        width: "10%",
        notFilterable: true,
        component: ThreeDotsGridDemoComponent,
        componentPropsMapper: (cellValue, row) =>  ({row})}
    ]
  }
};

export const GridHeight: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `
<div style="width: 100%">
      <odcp-grid style="width: 100%"
      [rows]="rows"
      [height]="height"
      [columns]="columns"></odcp-grid>
</div>
    `
  }),
  args: {
    height: 400,
    ...BasicUsage.args
  }
};

export const RowsHeight: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `
<div style="width: 100%">
      <odcp-grid style="width: 100%"
      [rows]="rows"
      [elementHeight]="elementHeight"
      [columns]="columns"></odcp-grid>
</div>
    `
  }),
  args: {
    elementHeight: 60,
    ...BasicUsage.args
  }
};

export const Selectable: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `
<div style="width: 100%">
      <odcp-grid style="width: 100%"
      [rows]="rows"
      [selectable]="selectable"
      [columns]="columns"></odcp-grid>
</div>
    `
  }),
  args: {
    selectable: true,
    ...BasicUsage.args
  }
};

export const Sortable: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `
<div style="width: 100%">
      <odcp-grid style="width: 100%"
      [rows]="rows"
      [sortable]="sortable"
      [columns]="columns"></odcp-grid>
</div>
    `
  }),
  args: {
    sortable: true,
    ...BasicUsage.args
  }
};

export const Filterable: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `
<div style="width: 100%">
      <odcp-grid style="width: 100%"
      [rows]="rows"
      [filterable]="filterable"
      [columns]="columns"></odcp-grid>
</div>
    `
  }),
  args: {
    filterable: true,
    ...BasicUsage.args
  }
};

export const FilterWithCustomComponent: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `
<div style="width: 100%">
      <odcp-grid style="width: 100%"
      [rows]="rows"
      [filterable]="filterable"
      [columns]="columns"></odcp-grid>
</div>
    `
  }),
  args: {
    filterable: true,
    ...BasicUsage.args,
    columns: [
      ...mockColumnsWithCustomComponent
    ]
  }
};

export const CaseInsensitiveFilterable: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `
<div style="width: 100%">
      <odcp-grid style="width: 100%"
      [rows]="rows"
      [filterable]="filterable"
      [caseInsensitiveFiltering]="caseInsensitiveFiltering"
      [columns]="columns"></odcp-grid>
</div>
    `
  }),
  args: {
    filterable: true,
    caseInsensitiveFiltering: true,
    ...BasicUsage.args
  }
};

export const TypesFilterable: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `
<div style="width: 100%">
      <odcp-grid style="width: 100%"
      [rows]="rows"
      [filterable]="filterable"
      [columns]="columns"></odcp-grid>
</div>
    `
  }),
  args: {
    filterable: true,
    ...BasicUsage.args,
    columns: [
      ...mockColumnsWithTypeFilter,
      {
        key: "actions",
        label: "Actions",
        type: "component",
        width: "10%",
        notFilterable: true,
        component: ThreeDotsGridDemoComponent,
        componentPropsMapper: (cellValue, row) =>  ({row})}
    ]
  }
};

export const FilterWithGlobalSearch: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `
      <div style="width: 100%">
        <odcp-grid style="width: 100%"
          [globalSearch]="true"
          [rows]="rows"
          [filterable]="filterable"
          [columns]="columns">
        </odcp-grid>
      </div>
    `
  }),
  args: {
    filterable: true,
    ...BasicUsage.args,
    columns: [
      ...mockColumns,
      {
        key: "actions",
        label: "Actions",
        type: "component",
        width: "10%",
        notFilterable: true,
        component: ThreeDotsGridDemoComponent,
        componentPropsMapper: (cellValue, row) =>  ({row})}
    ]
  }
};

export const AdvanceFilterable: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `
      <div style="width: 100%">
            <odcp-grid style="width: 100%"
            [rows]="rows"
            [filterable]="filterable"
            [advancedFilter]="advancedFilter"
            [columns]="columns"></odcp-grid>
      </div>
    `
  }),
  args: {
    filterable: true,
    advancedFilter: true,
    ...BasicUsage.args
  }
};

export const StikyHeader: Story = {
  render: (args) => ({
    props: {
      ...args
    },
    template: `
<div style="width: 100%">
      <odcp-grid style="width: 100%"
      [rows]="rows"
      [stickyHeader]="stickyHeader"
      [columns]="columns"></odcp-grid>
</div>
    `
  }),
  args: {
    stickyHeader: true,
    ...BasicUsage.args
  }
};

export const DownloadCsv: Story = {
  render: (args) => ({
    props: {
      ...args,
      downloadCsvClick: action('downloadCsvClick triggered'),
    },
    template: `
    <div style="width: 100%">
      <odcp-grid style="width: 100%"
      [rows]="rows"
      [stickyHeader]="stickyHeader"
      [columns]="columns"
      [downloadCsv]="downloadCsv"
      (downloadCsvClick)="downloadCsvClick()"></odcp-grid>
    </div>
    `
  }),
  args: {
    stickyHeader: true,
    downloadCsv: true,
    ...BasicUsage.args
  }
};

export const UpdateRowsFiltersPeristance: Story = {
  render: (args) => ({
    props: {
      ...args,
      increaseRows: function () {
        this['rows'] = generateMockRows(this['rows'].length + 50);
      },
      decreaseRows: function () {
        if (this['rows'].length > 0) {
          this['rows'] = generateMockRows(this['rows'].length - 50);
        }
      },
    },
    template: `
      <div style="width: 100%">
        <div style="margin-bottom: 12px; display: flex; gap: 8px;">
          <button (click)="increaseRows()">Add Rows</button>
          <button (click)="decreaseRows()">Reduce Rows</button>
          <span>Current rows: {{ rows.length }}</span>
        </div>
        <odcp-grid
          style="width: 100%"
          [rows]="rows"
          [filterable]="filterable"
          [columns]="columns">
        </odcp-grid>
      </div>
    `,
  }),
  args: {
    filterable: true,
    rows: generateMockRows(100),
    columns: [...mockColumns],
  },
};

export const DynamicColumnUpdate: Story = {
  render: (args) => ({
    props: { ...args },
    template: `<odcp-dynamic-column-demo [rows]="rows"></odcp-dynamic-column-demo>`,
  }),
  decorators: [
    moduleMetadata({
      imports: [DynamicColumnDemoComponent],
    }),
  ],
  args: {
    rows: generateMockRows(50),
    columns: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates dynamic column updates — renders with initial columns (id, name, age, country) then automatically replaces them after 2 seconds with a new set (id, name, country) to simulate real-time column configuration changes.',
      },
    },
  },
};
