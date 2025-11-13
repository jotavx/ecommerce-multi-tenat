import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceOptionsDialogComponent } from './choice-options-dialog.component';

describe('ChoiceOptionsDialogComponent', () => {
  let component: ChoiceOptionsDialogComponent;
  let fixture: ComponentFixture<ChoiceOptionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChoiceOptionsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChoiceOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
