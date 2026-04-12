import { booleanAttribute, Component, input, output, signal, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { RowMenuButtonComponent } from '@/shared/components/row-menu-button/row-menu-button.component';

@Component({
  selector: 'context-menu-component',
  templateUrl: './cm.component.html',
  styleUrls: ['./cm.component.scss'],
  standalone: true,
  imports: [MenuModule, RowMenuButtonComponent],
})
export class ContextMenuComponent {
  @ViewChild('menu') menu!: Menu;

  /** Показать кнопку «⋯» рядом с контентом; иначе меню только через `toggle(event)` снаружи. */
  showTrigger = input(false, { transform: booleanAttribute });

  triggerAriaLabel = input('Дополнительные действия');

  onEdit = output<void>();
  onDelete = output<void>();

  items = signal<MenuItem[]>([
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.onEdit.emit(),
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => this.onDelete.emit(),
    },
  ]);

  onTriggerClick(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.menu.toggle(event);
  }

  /** Открыть меню от внешней кнопки (не вызывать stopPropagation — это делает родитель при необходимости). */
  toggle(event: Event) {
    this.menu.toggle(event);
  }

  /** Совместимость со старым вызовом после ПКМ. */
  open(event: Event) {
    this.toggle(event);
  }
}
