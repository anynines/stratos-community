import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { CFAppState } from '../../../../../../../cloud-foundry/src/cf-app-state';
import {
  BooleanIndicatorType,
} from '../../../../../../../core/src/shared/components/boolean-indicator/boolean-indicator.component';
import {
  TableCellBooleanIndicatorComponent,
  TableCellBooleanIndicatorComponentConfig,
} from '../../../../../../../core/src/shared/components/list/list-table/table-cell-boolean-indicator/table-cell-boolean-indicator.component';
import { ITableColumn } from '../../../../../../../core/src/shared/components/list/list-table/table.types';
import { ListViewTypes } from '../../../../../../../core/src/shared/components/list/list.component.types';
import { MetricQueryType } from '../../../../../../../core/src/shared/services/metrics-range-selector.types';
import { ListView } from '../../../../../../../store/src/actions/list.actions';
import { MetricQueryConfig } from '../../../../../../../store/src/actions/metrics.actions';
import { FetchCFCellMetricsPaginatedAction } from '../../../../../actions/cf-metrics.actions';
import {
  CloudFoundryCellService,
} from '../../../../../features/cloud-foundry/tabs/cloud-foundry-cells/cloud-foundry-cell/cloud-foundry-cell.service';
import { BaseCfListConfig } from '../base-cf/base-cf-list-config';
import { CfCellHealthDataSource, CfCellHealthEntry, CfCellHealthState } from './cf-cell-health-source';

// TODO: Move file to CF package (#3769)

@Injectable()
export class CfCellHealthListConfigService extends BaseCfListConfig<CfCellHealthEntry> {

  dataSource: CfCellHealthDataSource;
  defaultView = 'table' as ListView;
  viewType = ListViewTypes.TABLE_ONLY;
  enableTextFilter = false;
  text = {
    title: 'Cell Health History',
    noEntries: 'Cell has no health history'
  };

  private boolIndicatorConfig: TableCellBooleanIndicatorComponentConfig<CfCellHealthEntry> = {
    isEnabled: (row: CfCellHealthEntry) =>
      row ? row.state === CfCellHealthState.HEALTHY || row.state === CfCellHealthState.INITIAL_HEALTHY : false,
    type: BooleanIndicatorType.healthyUnhealthy,
    subtle: false,
    showText: true
  };

  constructor(store: Store<CFAppState>, cloudFoundryCellService: CloudFoundryCellService, private datePipe: DatePipe) {
    super();
    const action = this.createMetricsAction(cloudFoundryCellService.cfGuid, cloudFoundryCellService.cellId);
    this.dataSource = new CfCellHealthDataSource(store, this, action);
    this.showCustomTime = true;
  }

  private createMetricsAction(cfGuid: string, cellId: string): FetchCFCellMetricsPaginatedAction {
    const action = new FetchCFCellMetricsPaginatedAction(
      cfGuid,
      cellId,
      new MetricQueryConfig(`firehose_value_metric_rep_unhealthy_cell{bosh_job_id="${cellId}"}`, {}),
      MetricQueryType.QUERY
    );
    action.initialParams['order-direction-field'] = 'dateTime';
    action.initialParams['order-direction'] = 'asc';
    return action;
  }

  getColumns = (): ITableColumn<CfCellHealthEntry>[] => [
    {
      columnId: 'dateTime',
      headerCell: () => 'Date/Time',
      cellFlex: '1',
      cellDefinition: {
        getValue: (entry: CfCellHealthEntry) => this.datePipe.transform(entry.timestamp * 1000, 'medium')
      },
      sort: {
        type: 'sort',
        orderKey: 'dateTime',
        field: 'timestamp'
      }
    },
    {
      columnId: 'state',
      headerCell: () => 'Cell Health Updated',
      cellComponent: TableCellBooleanIndicatorComponent,
      cellConfig: this.boolIndicatorConfig,
      cellFlex: '1',
      sort: {
        type: 'sort',
        orderKey: 'state',
        field: 'state'
      }
    },
  ]
  getDataSource = () => this.dataSource;
}
