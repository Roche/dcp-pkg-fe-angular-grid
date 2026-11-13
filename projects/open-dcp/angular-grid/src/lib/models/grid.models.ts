import {OperatorType} from "@open-dcp/grid";
import { Column as OriginalColumn } from '@open-dcp/grid';

export interface GridColumn extends OriginalColumn {
  width?: string | number;
  notSortable?: boolean;
  notFilterable?: boolean;
  filterType?: filterTypes;
  filterSettings?: filterSettingsTypes;
  defaultOperator?: OperatorType;
}

export type filterTypes = 'boolean' | 'date' | 'datetime' | 'integer' | 'types';

export type filterSettingsTypes = TypesFilterSettings;

export interface BodyCellSpecialValues {
  'null': string;
  'undefined': string;
}

export interface FilterDefinition {
  operator: OperatorType;
  value: any;
}

export interface FilterImplementation {
  getFilterDefinition: () => null | FilterDefinition | FilterDefinition[];
  resetFilter: () => void;
  valid: () => boolean;
}


export interface TypesFilterSettings {
  [key: string]: string | number | boolean
}
