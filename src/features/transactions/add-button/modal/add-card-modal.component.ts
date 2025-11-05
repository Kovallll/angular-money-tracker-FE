import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CategoriesHttpService, CreateCategoryItem } from '@/shared';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';

@Component({
  selector: 'add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [FormsModule, InputTextModule, ButtonModule, MessageModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCategoryModalComponent {
  messageService = inject(MessageService);
  private categoriesHttpService = inject(CategoriesHttpService);
  private ref = inject(DynamicDialogRef);
  queryClient = inject(QueryClient);

  card = {
    title: '',
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

  createCategory(title: string) {
    this.mutation.mutate({
      title,
    });
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.createCategory(form.value.categoryName);
    }
  }
}
