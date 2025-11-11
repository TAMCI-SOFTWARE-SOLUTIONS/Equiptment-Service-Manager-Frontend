import {Component, computed, input, output, TemplateRef} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {RouterLink} from '@angular/router';
import {RippleModule} from 'primeng/ripple';
import {MenuModule} from 'primeng/menu';
import {MenuItem} from 'primeng/api';

export interface PageHeaderAction {
  id: string;
  label: string;
  icon: string;
  visible?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  mobileLabel?: string;
  showInMobile?: boolean;
  onClick: () => void;
}

export interface PageHeaderMoreAction extends MenuItem {
  visible?: boolean;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RippleModule,
    MenuModule
  ],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css'
})
export class PageHeaderComponent {
  loading = input<boolean>(false);

  showBackButton = input<boolean>(true);
  backLabel = input<string>('Volver');
  backIcon = input<string>('pi-arrow-left');
  backRoute = input<string | null>(null);

  title = input.required<string>();
  subtitle = input<string>('');
  titleIcon = input<string>('');
  titleClass = input<string>('text-xl font-bold text-gray-900 lg:text-2xl');
  subtitleClass = input<string>('text-sm text-gray-600');

  truncateTitle = input<boolean>(true);
  truncateSubtitle = input<boolean>(true);
  maxTitleLines = input<number>(2);
  maxSubtitleLines = input<number>(2);

  headerContent = input<TemplateRef<any> | null>(null);

  showRefreshButton = input<boolean>(true);
  primaryActions = input<PageHeaderAction[]>([]);

  moreActions = input<PageHeaderMoreAction[]>([]);
  moreActionsLabel = input<string>('Más acciones');
  moreActionsMobileLabel = input<string>('Acciones');

  mobileStrategy = input<'compact' | 'menu'>('menu');

  back = output<void>();
  refresh = output<void>();

  visiblePrimaryActions = computed(() => {
    return this.primaryActions().filter(action => action.visible !== false);
  });

  titleClasses = computed(() => {
    const base = this.titleClass();
    if (this.truncateTitle()) {
      return `${base} line-clamp-${this.maxTitleLines()}`;
    }
    return base;
  });

  subtitleClasses = computed(() => {
    const base = this.subtitleClass();
    if (this.truncateSubtitle()) {
      return `${base} line-clamp-${this.maxSubtitleLines()}`;
    }
    return base;
  });

  mobilePrimaryActions = computed(() => {
    if (this.mobileStrategy() === 'compact') {
      return this.visiblePrimaryActions().filter(action => action.showInMobile !== false);
    }
    return [];
  });

  mobileMenuActions = computed(() => {
    if (this.mobileStrategy() === 'menu') {
      return [
        ...this.visiblePrimaryActions().map(action => ({
          label: action.label,
          icon: `pi ${action.icon}`,
          disabled: action.disabled,
          visible: true,
          command: () => action.onClick(),
          styleClass: action.variant === 'primary' ? 'font-semibold' : ''
        })),
        ...(this.visiblePrimaryActions().length > 0 && this.visibleMoreActions.length > 0
          ? [{ separator: true, visible: true }]
          : []),
        ...this.visibleMoreActions
      ];
    } else {
      return [
        ...this.visiblePrimaryActions()
          .filter(action => action.showInMobile === false)
          .map(action => ({
            label: action.label,
            icon: `pi ${action.icon}`,
            disabled: action.disabled,
            visible: true,
            command: () => action.onClick()
          })),
        ...(this.visiblePrimaryActions().filter(a => a.showInMobile === false).length > 0
        && this.visibleMoreActions.length > 0
          ? [{ separator: true, visible: true }]
          : []),
        ...this.visibleMoreActions
      ];
    }
  });

  get visibleMoreActions(): MenuItem[] {
    return this.moreActions().filter(action => action.visible !== false);
  }

  get showDesktopMoreActionsButton(): boolean {
    return this.visibleMoreActions.length > 0;
  }

  get showMobileMoreActionsButton(): boolean {
    return this.mobileMenuActions().filter(a => a.visible !== false).length > 0;
  }

  onBackClick(): void {
    this.back.emit();
  }

  onRefreshClick(): void {
    this.refresh.emit();
  }

  getActionClasses(variant: string = 'secondary'): string {
    const baseClasses = 'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm hover:shadow-md hover:shadow-sky-500/30 focus:ring-sky-500`;
      case 'secondary':
        return `${baseClasses} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-sky-500`;
      case 'ghost':
        return `${baseClasses} text-gray-700 hover:bg-gray-100 focus:ring-gray-500`;
      default:
        return `${baseClasses} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-sky-500`;
    }
  }

  toggleMoreActions(event: Event, menu: any): void {
    menu.toggle(event);
  }
}
