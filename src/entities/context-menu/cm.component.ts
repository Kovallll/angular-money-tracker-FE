import { booleanAttribute, Component, computed, input, output, ViewChild } from '@angular/core';
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

  /** Показывать пункт «Delete» (например, только для владельца комнаты). */
  showDelete = input(true, { transform: booleanAttribute });

  triggerAriaLabel = input('Дополнительные действия');

  onEdit = output<void>();
  onDelete = output<void>();

  readonly items = computed<MenuItem[]>(() => {
    const del = this.showDelete();
    return [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.onEdit.emit(),
      },
      ...(del
        ? [
            {
              label: 'Delete',
              icon: 'pi pi-trash',
              command: () => this.onDelete.emit(),
            },
          ]
        : []),
    ];
  });

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
