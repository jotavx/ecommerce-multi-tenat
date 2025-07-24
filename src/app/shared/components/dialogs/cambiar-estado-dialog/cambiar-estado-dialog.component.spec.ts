import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiarEstadoDialogComponent } from './cambiar-estado-dialog.component';

describe('CambiarEstadoDialogComponent', () => {
  let component: CambiarEstadoDialogComponent;
  let fixture: ComponentFixture<CambiarEstadoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CambiarEstadoDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CambiarEstadoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
