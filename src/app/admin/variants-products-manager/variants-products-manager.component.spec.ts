import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantsProductsManagerComponent } from './variants-products-manager.component';

describe('VariantsProductsManagerComponent', () => {
  let component: VariantsProductsManagerComponent;
  let fixture: ComponentFixture<VariantsProductsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantsProductsManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VariantsProductsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
