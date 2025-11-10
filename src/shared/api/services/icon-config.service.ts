import {IconType} from '../../model/enums/icon-type.enum';
import {IconSize} from '../../model/enums/icon-size.enum';
import {IconEntity} from '../../model/enums/icon-entity.enum';
import {Injectable} from '@angular/core';

export interface IconConfig {
  type: IconType;
  value: string;
  bgColor?: string;
  textColor?: string;
  size?: IconSize;
}

const DEFAULT_ICON_CONFIGS: Record<IconEntity, IconConfig> = {
  [IconEntity.CLIENT]: {
    type: IconType.PRIMEICON,
    value: 'pi-building',
    bgColor: 'bg-sky-100',
    textColor: 'text-sky-600',
    size: IconSize.MD
  },
  [IconEntity.PROJECT]: {
    type: IconType.PRIMEICON,
    value: 'pi-folder',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-600',
    size: IconSize.MD
  },
  [IconEntity.EQUIPMENT]: {
    type: IconType.PRIMEICON,
    value: 'pi-box',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    size: IconSize.MD
  },
  [IconEntity.CABINET]: {
    type: IconType.PRIMEICON,
    value: 'pi-server',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    size: IconSize.MD
  },
  [IconEntity.PANEL]: {
    type: IconType.PRIMEICON,
    value: 'pi-th-large',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-600',
    size: IconSize.MD
  },
  [IconEntity.SERVICE]: {
    type: IconType.PRIMEICON,
    value: 'pi-wrench',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-600',
    size: IconSize.MD
  },
  [IconEntity.USER]: {
    type: IconType.PRIMEICON,
    value: 'pi-user',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    size: IconSize.MD
  },
  [IconEntity.SUPERVISOR]: {
    type: IconType.PRIMEICON,
    value: 'pi-shield',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    size: IconSize.MD
  },
  [IconEntity.OPERATOR]: {
    type: IconType.PRIMEICON,
    value: 'pi-id-card',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    size: IconSize.MD
  }
};

@Injectable({
  providedIn: 'root'
})
export class IconConfigService {
  private configs = new Map<IconEntity, IconConfig>(
    Object.entries(DEFAULT_ICON_CONFIGS).map(([key, value]) => [
      key as IconEntity,
      value
    ])
  );

  getConfig(entity: IconEntity): IconConfig {
    const config = this.configs.get(entity);
    if (!config) {
      console.warn(`Icon config not found for entity: ${entity}`);
      return DEFAULT_ICON_CONFIGS[IconEntity.CLIENT];
    }
    return config;
  }

  updateConfig(entity: IconEntity, config: Partial<IconConfig>): void {
    const current = this.getConfig(entity);
    this.configs.set(entity, { ...current, ...config });
  }

  resetToDefaults(): void {
    this.configs = new Map(
      Object.entries(DEFAULT_ICON_CONFIGS).map(([key, value]) => [
        key as IconEntity,
        value
      ])
    );
  }

  getAllConfigs(): Map<IconEntity, IconConfig> {
    return new Map(this.configs);
  }
}
