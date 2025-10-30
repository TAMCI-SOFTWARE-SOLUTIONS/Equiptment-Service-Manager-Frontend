import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Drawer } from 'primeng/drawer';
import { Ripple } from 'primeng/ripple';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

@Component({
  selector: 'app-keyboard-shortcuts-help',
  standalone: true,
  imports: [CommonModule, Drawer, Ripple],
  templateUrl: './keyboard-shortcuts-help.component.html',
  styles: [`
    :host ::ng-deep .p-drawer {
      max-width: 500px;
    }
  `]
})
export class KeyboardShortcutsHelpComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  shortcuts: Shortcut[] = [
    // Navegación
    {
      keys: ['Ctrl', 'K'],
      description: 'Enfocar búsqueda',
      category: 'Navegación'
    },
    {
      keys: ['Esc'],
      description: 'Cerrar búsqueda / Cancelar formulario',
      category: 'Navegación'
    },
    {
      keys: ['Ctrl', 'R'],
      description: 'Actualizar datos',
      category: 'Navegación'
    },
    {
      keys: ['?'],
      description: 'Mostrar esta ayuda',
      category: 'Navegación'
    },

    // Formularios
    {
      keys: ['Enter'],
      description: 'Guardar formulario activo',
      category: 'Formularios'
    },
    {
      keys: ['Esc'],
      description: 'Cancelar edición',
      category: 'Formularios'
    },

    // Accordion
    {
      keys: ['Space'],
      description: 'Expandir/colapsar item seleccionado',
      category: 'Accordion'
    },
    {
      keys: ['↑', '↓'],
      description: 'Navegar entre items',
      category: 'Accordion'
    },
    {
      keys: ['→'],
      description: 'Expandir item',
      category: 'Accordion'
    },
    {
      keys: ['←'],
      description: 'Colapsar item',
      category: 'Accordion'
    },

    // Acciones
    {
      keys: ['Ctrl', 'N'],
      description: 'Nueva marca',
      category: 'Acciones'
    }
  ];

  get groupedShortcuts(): Record<string, Shortcut[]> {
    return this.shortcuts.reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    }, {} as Record<string, Shortcut[]>);
  }

  get categories(): string[] {
    return Object.keys(this.groupedShortcuts);
  }

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
