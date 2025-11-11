import {Component, output} from '@angular/core';
import {RouterLink} from '@angular/router';
import {input} from '@angular/core';
import {NgClass} from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  isActive?: boolean;
  icon?: string;
  queryParams?: any;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  items = input<BreadcrumbItem[]>([]);
  separator = input<string>('pi-chevron-right');
  showHome = input<boolean>(true);
  maxMobileLabelLength = input<number>(25);
  loading = input<boolean>(false);

  itemClick = output<BreadcrumbItem>();

  onItemClick(item: BreadcrumbItem): void {
    this.itemClick.emit(item);
  }

  truncateLabel(label: string, maxLength?: number): string {
    const max = maxLength ?? this.maxMobileLabelLength();
    return label.length > max
      ? label.substring(0, max) + '...'
      : label;
  }

  get skeletonItems(): number[] {
    return [1, 2, 3]; // 3 items de skeleton por defecto
  }
}
