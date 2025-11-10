import {Component, computed, inject, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IconEntity} from '../../model/enums/icon-entity.enum';
import {IconSize} from '../../model/enums/icon-size.enum';
import {IconConfigService} from '../../api/services/icon-config.service';
import {IconType} from '../../model/enums/icon-type.enum';
import {IconRounded} from '../../model/enums/icon.rounded';

@Component({
  selector: 'app-entity-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="finalContainerClasses()">

      @if (iconConfig().type === IconType.PRIMEICON) {
        <i [class]="'pi ' + iconConfig().value + ' ' + finalIconClasses()"></i>
      }

      @if (iconConfig().type === IconType.CUSTOM || iconConfig().type === IconType.IMAGE) {
        <img
          [src]="iconConfig().value"
          [alt]="entity() + ' icon'"
          [class]="'object-contain ' + imageClasses()" />
      }
    </div>
  `,
})
export class EntityIconComponent {
  readonly entity = input.required<IconEntity>();
  readonly size = input<IconSize | null>(null);
  readonly bgColor = input<string | null>(null);
  readonly textColor = input<string | null>(null);
  readonly rounded = input<IconRounded>(IconRounded.LG);
  readonly customClasses = input<string>('');

  private readonly iconConfigService = inject(IconConfigService);

  readonly IconType = IconType;

  readonly iconConfig = computed(() => {
    const config = this.iconConfigService.getConfig(this.entity());
    return {
      ...config,
      size: this.size() || config.size || IconSize.MD,
      bgColor: this.bgColor() || config.bgColor || 'bg-gray-100',
      textColor: this.textColor() || config.textColor || 'text-gray-600'
    };
  });

  readonly baseContainerClasses = computed(() => {
    const config = this.iconConfig();
    const sizeClasses: Record<IconSize, string> = {
      [IconSize.SM]: 'h-8 w-8',
      [IconSize.MD]: 'h-10 w-10',
      [IconSize.LG]: 'h-12 w-12',
      [IconSize.XL]: 'h-16 w-16'
    };

    const roundedClasses = {
      [IconRounded.NONE]: 'rounded-none',
      [IconRounded.SM]: 'rounded-sm',
      [IconRounded.MD]: 'rounded-md',
      [IconRounded.LG]: 'rounded-lg',
      [IconRounded.FULL]: 'rounded-full'
    };

    return `flex items-center justify-center transition-all overflow-hidden ${sizeClasses[config.size]} ${roundedClasses[this.rounded()]}`;
  });

  readonly finalContainerClasses = computed(() => {
    const config = this.iconConfig();
    const base = this.baseContainerClasses();
    return `${base} ${this.customClasses()} ${config.bgColor} ${config.textColor}`;
  });


  readonly finalIconClasses = computed(() => {
    const config = this.iconConfig();
    const textSizeClasses: Record<IconSize, string> = {
      [IconSize.SM]: 'text-sm',
      [IconSize.MD]: 'text-lg',
      [IconSize.LG]: 'text-xl',
      [IconSize.XL]: 'text-3xl'
    };

    return textSizeClasses[config.size];
  });

  readonly imageClasses = computed(() => {
    const config = this.iconConfig();
    const imageSizeClasses: Record<IconSize, string> = {
      [IconSize.SM]: 'h-full w-full object-cover rounded-full',
      [IconSize.MD]: 'h-full w-full object-cover rounded-full',
      [IconSize.LG]: 'h-full w-full object-cover rounded-full',
      [IconSize.XL]: 'h-full w-full object-cover rounded-full'
    };

    return imageSizeClasses[config.size];
  });

}
