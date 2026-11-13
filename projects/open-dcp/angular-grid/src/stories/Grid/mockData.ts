import { Row } from "@open-dcp/grid";
import {GridColumn} from "../../lib/models/grid.models";
import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-age',
  standalone: true,
  imports: [
    CommonModule
  ],
  providers: [],
  styles: [`
    .color {
      width: 16px;
      height: 16px;
      border-radius: 2px;
    }
    .overview-color {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
  `],
  template: '<div class="overview-color"><div class="color" [style.backgroundColor]="backgroundColor"></div><div>{{score}}</div></div>',
})

export class AgeComponent implements OnInit {
  @Input() cellValue!: any;
  @Input() row!: any;

  backgroundColor = 'grey';
  score = "NaN";

  constructor() {
  }

  ngOnInit(): void {
    if (this.cellValue.raw) {
      this.score = this.cellValue.raw;
    }
  }
}

// Mock column definitions
export const mockColumns: GridColumn[] = [
  { key: "id", label: "ID", width: "10%", type: "integer" },
  { key: "name", label: "Name", type: "string", defaultOperator: "contains" },
  { key: "age", label: "Age", width: "20%", type: "number", defaultOperator: "contains" },
  { key: "country", label: "Country", width: "40%", type: "string" },
];

// Mock column definitions
export const mockColumnsWithTypeFilter: GridColumn[] = [
  { key: "id", label: "ID", width: "10%", type: "integer" },
  { key: "name", label: "Name", width: "30%", type: "string"},
  { key: "age", label: "Age", width: "20%", type: "number" },
  {
    key: "country",
    label: "Country",
    width: "40%",
    type: "string",
    filterType: 'types',
    filterSettings: {
      'USA': 'USA',
      'Canada': 'Canada',
      'UK': 'UK',
      'Germany': 'Germany',
      'France': 'France',
      'Australia': 'Australia'
    }
  },
];

// Mock row data generator
export const generateMockRows = (count: number = 100): any[] => {
    const countries = ["USA", "Canada", "UK", "Germany", "France", "Australia"];
    const rows: any[] = [];

    for (let i = 1; i <= count; i++) {
        rows.push({
            id: i,
            name: `User ${i}`,
            age: Math.floor(Math.random() * 60) + 18,
            country: countries[Math.floor(Math.random() * countries.length)],
        });
    }

    return rows;
};

// Mock column definitions with diverse types
export const diverseColumns: GridColumn[] = [
    { key: "id", label: "ID", type: "integer", width: "10%" },
    { key: "name", label: "Name", type: "string", width: "20%" },
    { key: "age", label: "Age", type: "number", width: "10%" },
    { key: "birthDate", label: "Birth Date", type: "date", width: "15%" },
    { key: "lastLogin", label: "Last Login", type: "datetime", width: "15%" },
    { key: "sessionDuration", label: "Session Duration", type: "duration", width: "15%" },
    {
      key: "actions",
      label: "Actions",
      type: "component",
      width: "10%",
      component: "GxpStatus",
      filterType: 'types',
      filterSettings: {
        'GXP': 'gxp',
        'Non-GXP': 'nongxp'
      }
    },
];

// Mock row data generator for diverse columns
export const generateDiverseMockRows = (count: number = 100): Row[] => {
    const statuses = ["Active", "Inactive", "Pending"];
    const rows: any[] = [];

    for (let i = 1; i <= count; i++) {
        rows.push({
            id: i,
            name: `User ${i}`,
            age: (Math.random() * 6000) / 100 + 18,
            birthDate: new Date(
                1980 + Math.floor(Math.random() * 40),
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28)
            ).toISOString().split("T")[0],
            lastLogin: new Date().toISOString(),
            sessionDuration: `${Math.floor(Math.random() * 5)}h ${Math.floor(Math.random() * 60)}m`,
            actions: { id: i },
        });
    }

    return rows;
};

// Mock filter with filter type and custom component
export const mockColumnsWithCustomComponent: GridColumn[] = [
  { key: "id", label: "ID", width: "10%", type: "integer" },
  { key: "name", label: "Name", width: "30%", type: "string", defaultOperator: "contains" },
  { key: "age", label: "Age", width: "20%",  defaultOperator: "contains", filterType: "integer",
    type: 'component',  component: AgeComponent,
    componentPropsMapper: (cellValue: any, row: any) =>  ({cellValue, row})
  },
  { key: "country", label: "Country", width: "40%", type: "string" },
];
