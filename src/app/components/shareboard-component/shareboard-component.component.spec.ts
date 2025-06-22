import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareboardComponentComponent } from './shareboard-component.component';

describe('ShareboardComponentComponent', () => {
  let component: ShareboardComponentComponent;
  let fixture: ComponentFixture<ShareboardComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareboardComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareboardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
