import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBusinessDialogComponent } from './edit-business-dialog.component';

describe('EditBusinessDialogComponent', () => {
  let component: EditBusinessDialogComponent;
  let fixture: ComponentFixture<EditBusinessDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditBusinessDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditBusinessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
