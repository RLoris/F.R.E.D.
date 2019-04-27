import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillMusicVideoComponent } from './chill-music-video.component';

describe('ChillMusicVideoComponent', () => {
  let component: ChillMusicVideoComponent;
  let fixture: ComponentFixture<ChillMusicVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChillMusicVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChillMusicVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
