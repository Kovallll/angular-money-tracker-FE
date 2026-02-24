import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  CategoriesHttpService,
  CreateCategoryItem,
  CATEGORY_ICON_OPTIONS,
  DEFAULT_CATEGORY_ICON,
} from '@/shared';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { Select } from 'primeng/select';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [FormsModule, InputTextModule, ButtonModule, MessageModule, Select, AppIconComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCategoryModalComponent {
  messageService = inject(MessageService);
  private categoriesHttpService = inject(CategoriesHttpService);
  private ref = inject(DynamicDialogRef);
  queryClient = inject(QueryClient);

  iconOptions = CATEGORY_ICON_OPTIONS;

  /** Не закрывать выпадающий список иконок при скролле внутри него */
  iconSelectOverlayOptions = {
    listener: (event: Event, ctx?: { type?: string; valid?: boolean }) =>
      ctx?.type === 'scroll' ? false : (ctx?.valid ?? true),
  };

  card = {
    title: '',
    icon: DEFAULT_CATEGORY_ICON,
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
        icon: this.card.icon,
      });
    }
  }

  close(): void {
    this.ref.close();
  }
}
