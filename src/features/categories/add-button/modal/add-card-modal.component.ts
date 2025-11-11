import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CategoriesHttpService, CreateCategoryItem } from '@/shared';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { PrimeIcons, MenuItem } from 'primeng/api';
import { Select } from 'primeng/select';

@Component({
  selector: 'add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [FormsModule, InputTextModule, ButtonModule, MessageModule, Select],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCategoryModalComponent implements OnInit {
  messageService = inject(MessageService);
  private categoriesHttpService = inject(CategoriesHttpService);
  private ref = inject(DynamicDialogRef);
  queryClient = inject(QueryClient);

  items = signal<MenuItem[]>([]);
  selectedItem = signal({ label: 'Table', icon: PrimeIcons.TABLE });

  card = {
    title: '',
    icon: this.selectedItem().icon,
  };

  mutation = injectMutation(() => ({
    mutationFn: (category: CreateCategoryItem) =>
      this.categoriesHttpService.createCategory(category),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['categories'] });
      this.queryClient.invalidateQueries({ queryKey: ['charts'] });
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Success',
        detail: 'Card created successfully',
        life: 3000,
      });
      this.ref.close();
    },
    onError: () => {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create category',
        life: 3000,
      });
    },
  }));

  createCategory(category: CreateCategoryItem) {
    this.mutation.mutate(category);
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.createCategory({
        title: form.value.categoryName,
        icon: this.selectedItem().icon,
      });
    }
  }

  ngOnInit() {
    this.items.set([
      {
        label: 'New',
        icon: PrimeIcons.PLUS,
      },
      {
        label: 'Delete',
        icon: PrimeIcons.TRASH,
      },
      {
        label: 'Edit',
        icon: PrimeIcons.PENCIL,
      },
      {
        label: 'Duplicate',
        icon: PrimeIcons.COPY,
      },
      {
        label: 'View',
        icon: PrimeIcons.EYE,
      },
      {
        label: 'Amazon',
        icon: PrimeIcons.AMAZON,
      },
    ]);
  }
}
