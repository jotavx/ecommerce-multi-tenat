import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPriceDialogComponent } from './custom-price-dialog.component';

describe('CustomPriceDialogComponent', () => {
  let component: CustomPriceDialogComponent;
  let fixture: ComponentFixture<CustomPriceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomPriceDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomPriceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
