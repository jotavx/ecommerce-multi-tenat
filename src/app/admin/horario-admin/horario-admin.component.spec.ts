import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioAdminComponent } from './horario-admin.component';

describe('HorarioAdminComponent', () => {
  let component: HorarioAdminComponent;
  let fixture: ComponentFixture<HorarioAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HorarioAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HorarioAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
