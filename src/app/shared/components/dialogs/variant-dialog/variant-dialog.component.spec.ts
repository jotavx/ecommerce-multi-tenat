import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantDialogComponent } from './variant-dialog.component';

describe('VariantDialogComponent', () => {
  let component: VariantDialogComponent;
  let fixture: ComponentFixture<VariantDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VariantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
