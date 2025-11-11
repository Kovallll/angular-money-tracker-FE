import { Component, input, output, signal, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
@Component({
  selector: 'context-menu-component',
  templateUrl: './cm.component.html',
  styleUrls: ['./cm.component.scss'],
  standalone: true,
  imports: [ContextMenuModule],
})
export class ContextMenuComponent {
  @ViewChild('menu') menu!: ContextMenu;

  target = input<HTMLElement>();
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

  open(event: MouseEvent) {
    this.menu.show(event);
  }
}
