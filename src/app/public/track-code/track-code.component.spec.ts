import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackCodeComponent } from './track-code.component';

describe('TrackCodeComponent', () => {
  let component: TrackCodeComponent;
  let fixture: ComponentFixture<TrackCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrackCodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrackCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
