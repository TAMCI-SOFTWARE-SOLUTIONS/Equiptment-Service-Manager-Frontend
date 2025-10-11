import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {LayoutStore} from '../../../shared/model/layout.store';
import {TopbarComponent} from '../topbar/topbar.component';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopbarComponent
  ],
  providers: [
    LayoutStore
  ],
  standalone: true,
  templateUrl: './main-layout.layout.html',
  styleUrl: './main-layout.layout.css'
})
export class MainLayoutLayout implements OnInit, OnDestroy {
  readonly layoutStore = inject(LayoutStore);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.TabletPortrait])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.matches) {
          // Es mobile o tablet
          this.layoutStore.setMobile();
        } else {
          // Es desktop
          this.layoutStore.setDesktop();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
