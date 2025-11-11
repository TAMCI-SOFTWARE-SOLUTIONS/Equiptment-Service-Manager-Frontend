import {Component, output} from '@angular/core';
import {RouterLink} from '@angular/router';
import {input} from '@angular/core';

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
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  items = input<BreadcrumbItem[]>([]);
  separator = input<string>('pi-chevron-right');
  showHome = input<boolean>(true);
  maxMobileLabelLength = input<number>(25);

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
}
