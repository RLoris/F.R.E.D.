import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelaxAndBreatheComponent } from './relax-and-breathe.component';

describe('RelaxAndBreatheComponent', () => {
  let component: RelaxAndBreatheComponent;
  let fixture: ComponentFixture<RelaxAndBreatheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelaxAndBreatheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelaxAndBreatheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
