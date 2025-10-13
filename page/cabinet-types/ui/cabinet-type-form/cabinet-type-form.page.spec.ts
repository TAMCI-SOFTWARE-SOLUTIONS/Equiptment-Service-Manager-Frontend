import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinetTypeFormPage } from './cabinet-type-form.page';

describe('CabinetTypeFormPage', () => {
  let component: CabinetTypeFormPage;
  let fixture: ComponentFixture<CabinetTypeFormPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabinetTypeFormPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CabinetTypeFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
