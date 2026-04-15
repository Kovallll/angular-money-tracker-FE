import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AppModalShellComponent } from '@/shared/components/app-modal-shell/app-modal-shell.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  CategoriesHttpService,
  CategoryItem,
  CreateCategoryItem,
  getCategoryIconName,
} from '@/shared';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { CategoryIconPickerComponent } from '@/shared/components/category-icon-picker/category-icon-picker.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

@Component({
  selector: 'edit-category-modal',
  templateUrl: './edit-card-modal.component.html',
  styleUrls: ['./edit-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    AppModalShellComponent,
    MessageModule,
    CategoryIconPickerComponent,
    TranslateModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCategoryModalComponent {
  messageService = inject(MessageService);
  private categoriesHttpService = inject(CategoriesHttpService);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  queryClient = inject(QueryClient);
  private i18n = inject(I18nService);

  category = this.config.data as CategoryItem;

  card = {
    title: this.category.title,
    icon: getCategoryIconName(this.category.icon),
  };

  mutation = injectMutation(() => ({
    mutationFn: (category: CreateCategoryItem) =>
      this.categoriesHttpService.updateCategory(this.category.id, category),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['categories'] });
      this.queryClient.invalidateQueries({ queryKey: ['charts'] });
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: this.i18n.t('common.success'),
        detail: this.i18n.t('categories.toast.updated'),
        life: 3000,
      });
      this.ref.close(true);
    },
    onError: () => {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('common.error'),
        detail: this.i18n.t('categories.toast.updateError'),
        life: 3000,
      });
    },
  }));

  updateCategory(category: CreateCategoryItem) {
    this.mutation.mutate(category);
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.updateCategory({
        title: this.card.title,
        icon: this.card.icon,
      });
    }
  }

  close(): void {
    this.ref.close();
  }
}
