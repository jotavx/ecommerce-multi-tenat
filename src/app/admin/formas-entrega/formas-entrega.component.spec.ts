import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasEntregaComponent } from './formas-entrega.component';

describe('FormasEntregaComponent', () => {
  let component: FormasEntregaComponent;
  let fixture: ComponentFixture<FormasEntregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormasEntregaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
