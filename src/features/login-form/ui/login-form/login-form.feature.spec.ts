import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFormFeature } from './login-form.feature';

describe('LoginFormFeature', () => {
  let component: LoginFormFeature;
  let fixture: ComponentFixture<LoginFormFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFormFeature]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginFormFeature);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
