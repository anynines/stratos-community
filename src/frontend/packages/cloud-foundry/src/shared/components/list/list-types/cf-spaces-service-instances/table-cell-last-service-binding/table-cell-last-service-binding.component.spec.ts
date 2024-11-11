import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {
  BooleanIndicatorComponent,
} from '../../../../../../../../core/src/shared/components/boolean-indicator/boolean-indicator.component';
import { BaseTestModulesNoShared } from '../../../../../../../../core/test-framework/core-test.helper';
import { EntityMonitorFactory } from '../../../../../../../../store/src/monitors/entity-monitor.factory.service';
import { ServiceInstanceLastOpComponent } from '../../../../service-instance-last-op/service-instance-last-op.component';
import { TableCellServiceLastServiceBindingComponent } from './table-cell-last-service-binding.component';

describe('TableCellServiceLastServiceBindingComponent', () => {
  let component: TableCellServiceLastServiceBindingComponent;
  let fixture: ComponentFixture<TableCellServiceLastServiceBindingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        TableCellServiceLastServiceBindingComponent,
        ServiceInstanceLastOpComponent,
        BooleanIndicatorComponent
      ],
      imports: [...BaseTestModulesNoShared],
      providers: [EntityMonitorFactory]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellServiceLastServiceBindingComponent);
    component = fixture.componentInstance;
    component.row = {
      entity: {
        service_plan_guid: '',
        space_guid: '',
        dashboard_url: '',
        type: '',
        service_guid: '',
        service_plan_url: '',
        service_bindings_url: '',
        service_keys_url: '',
        routes_url: '',
        service_url: '',
      },
      metadata: {
        created_at: '',
        guid: '',
        updated_at: '',
        url: ''
      }
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

