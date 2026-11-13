import { Injectable } from '@angular/core';
import {OperatorType} from "@open-dcp/grid";
import {TranslateService} from "@ngx-translate/core";

export type OperatorOption = { label: string; value: OperatorType };

const OPERATOR_LABELS: Record<OperatorType, string> = {
  '=': 'odcp.grid.filter.operator.equals',
  '!=': 'odcp.grid.filter.operator.notEquals',
  '>': 'odcp.grid.filter.operator.greaterThan',
  '<': 'odcp.grid.filter.operator.lessThan',
  '>=': 'odcp.grid.filter.operator.greaterThanOrEqual',
  '<=': 'odcp.grid.filter.operator.lessThanOrEqual',
  contains: 'odcp.grid.filter.operator.contains',
  doesNotContain: 'odcp.grid.filter.operator.doesNotContain',
  startsWith: 'odcp.grid.filter.operator.startsWith',
  doesNotStartWith: 'odcp.grid.filter.operator.doesNotStartWith',
  endsWith: 'odcp.grid.filter.operator.endsWith',
  doesNotEndWith: 'odcp.grid.filter.operator.doesNotEndWith',
  matches: 'odcp.grid.filter.operator.matches',
  isTrue: 'odcp.grid.filter.operator.isTrue',
  isFalse: 'odcp.grid.filter.operator.isFalse',
  in: 'odcp.grid.filter.operator.in',
  notIn: 'odcp.grid.filter.operator.notIn',
  isNull: 'odcp.grid.filter.operator.isNull',
  isNotNull: 'odcp.grid.filter.operator.isNotNull',
  empty: 'odcp.grid.filter.operator.empty',
  notEmpty: 'odcp.grid.filter.operator.notEmpty',
  between: 'odcp.grid.filter.operator.between',
  notBetween: 'odcp.grid.filter.operator.notBetween'
};

const PREDEFINED_OPERATOR_SETS: Record<string, OperatorType[]> = {
  numeric: [
    '=', '!=', '>', '<', '>=', '<=', 'between', 'notBetween', 'isNull', 'isNotNull', 'empty', 'notEmpty', 'in', 'notIn'
  ],
  string: [
    '=', '!=', 'contains', 'doesNotContain', 'startsWith', 'doesNotStartWith', 'endsWith', 'doesNotEndWith',
    'matches', 'isNull', 'isNotNull', 'empty', 'notEmpty', 'in', 'notIn'
  ],
  date: [
    '=', '!=', '>', '<', '>=', '<=', 'between', 'notBetween', 'isNull', 'isNotNull', 'empty', 'notEmpty', 'in', 'notIn'
  ],
  boolean: [
    'isTrue', 'isFalse', 'isNull', 'isNotNull'
  ]
};

type OperatorSetKey = keyof typeof PREDEFINED_OPERATOR_SETS;

type OperatorOverrides = {
  include?: OperatorType[];
  exclude?: OperatorType[];
};

@Injectable({
  providedIn: 'root'
})
export class FilterOperatorService {
  constructor(
    private readonly translate: TranslateService
  ) {
    translate.setTranslation('en', {
      odcp: {
        date: 'Date',
        time: 'Time',
        startDate: 'Start Date',
        startTime: 'Start Time',
        endDate: 'End Date',
        endTime: 'End Time',
        duration: 'Duration (hh:mm:ss)',
        timeFormat24: 'Format: HH:MM (24hr)',
        operator: 'Operator',
        value: 'Value',
        grid: {
          filter: {
            errors: {
              invalidDurationFormat: 'Invalid format (hh:mm:ss)'
            },
            operator: {
              equals: '=',
              notEquals: '!=',
              greaterThan: '>',
              lessThan: '<',
              greaterThanOrEqual: '>=',
              lessThanOrEqual: '<=',
              contains: 'Contains',
              doesNotContain: 'Does Not Contains',
              startsWith: 'Starts With',
              doesNotStartWith: 'Does Not Start With',
              endsWith: 'Ends With',
              doesNotEndWith: 'Does Not End With',
              matches: 'Matches',
              isTrue: 'Is True',
              isFalse: 'Is False',
              in: 'In',
              notIn:'Not In',
              isNull: 'Is Null',
              isNotNull: 'Is Not Null',
              empty: 'Empty',
              notEmpty: 'Not Empty',
              between: 'Between',
              notBetween: 'Not Between'
            }
          }
        }
      }
    }, true);
    translate.setTranslation('de', {
      odcp: {
        date: 'Date',
        time: 'Time',
        startDate: 'Start Date',
        startTime: 'Start Time',
        endDate: 'End Date',
        endTime: 'End Time',
        duration: 'Duration (hh:mm:ss)',
        timeFormat24: 'Format: HH:MM (24hr)',
        operator: 'Operator',
        value: 'Value',
        grid: {
          filter: {
            errors: {
              invalidDurationFormat: 'Invalid format (hh:mm:ss)'
            },
            operator: {
              equals: '=',
              notEquals: '!=',
              greaterThan: '>',
              lessThan: '<',
              greaterThanOrEqual: '>=',
              lessThanOrEqual: '<=',
              contains: 'Contains',
              doesNotContain: 'Does Not Contains',
              startsWith: 'Starts With',
              doesNotStartWith: 'Does Not Start With',
              endsWith: 'Ends With',
              doesNotEndWith: 'Does Not End With',
              matches: 'Matches',
              isTrue: 'Is True',
              isFalse: 'Is False',
              in: 'In',
              notIn:'Not In',
              isNull: 'Is Null',
              isNotNull: 'Is Not Null',
              empty: 'Empty',
              notEmpty: 'Not Empty',
              between: 'Between',
              notBetween: 'Not Between'
            }
          }
        }
      }
    }, true);
  }


  // Mimics useFilterOperatorList('date', t)
  getFilterOperators(
    typeOrList: OperatorSetKey | OperatorType[],
    overrides?: OperatorOverrides
  ): OperatorOption[] {
    let operators: OperatorType[] = Array.isArray(typeOrList)
      ? typeOrList
      : PREDEFINED_OPERATOR_SETS[typeOrList] ?? [];

    if (!Array.isArray(typeOrList) && overrides) {
      if (overrides.exclude) {
        operators = operators.filter(op => !overrides.exclude!.includes(op));
      }
      if (overrides.include) {
        operators = [...operators, ...overrides.include.filter(op => !operators.includes(op))];
      }
    }

    return operators.map(op => ({
      label: this.translate.instant(OPERATOR_LABELS[op] ?? op),
      value: op
    }));
  }
}
