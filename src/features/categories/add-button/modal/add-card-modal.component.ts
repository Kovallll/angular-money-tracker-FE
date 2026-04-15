import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AppModalShellComponent } from '@/shared/components/app-modal-shell/app-modal-shell.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CategoriesHttpService, CreateCategoryItem, DEFAULT_CATEGORY_ICON } from '@/shared';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { CategoryIconPickerComponent } from '@/shared/components/category-icon-picker/category-icon-picker.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

@Component({
  selector: 'add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
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
export class AddCategoryModalComponent {
  messageService = inject(MessageService);
  private categoriesHttpService = inject(CategoriesHttpService);
  private ref = inject(DynamicDialogRef);
  private dialogConfig = inject(DynamicDialogConfig, { optional: true });
  queryClient = inject(QueryClient);
  private i18n = inject(I18nService);

  /** Если задан — категория создаётся в комнате, а не в личном списке. */
  protected getGroupRoomId(): string | undefined {
    const d = this.dialogConfig?.data as { groupRoomId?: unknown } | undefined;
    const v = d?.groupRoomId;
    return typeof v === 'string' && v.trim() ? v.trim() : undefined;
  }

  card = {
    title: '',
    icon: DEFAULT_CATEGORY_ICON,
  };

  mutation = injectMutation(() => ({
    mutationFn: (category: CreateCategoryItem) => {
      const roomId = this.getGroupRoomId();
      return roomId
        ? this.categoriesHttpService.createCategoryInRoom(roomId, category)
        : this.categoriesHttpService.createCategory(category);
    },
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['categories'] });
      const roomId = this.getGroupRoomId();
      if (roomId) {
        this.queryClient.invalidateQueries({ queryKey: ['categories', 'scope', roomId] });
        void this.queryClient.invalidateQueries({ queryKey: ['charts', 'room', roomId] });
      }
      this.queryClient.invalidateQueries({ queryKey: ['charts'] });
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: this.i18n.t('common.success'),
        detail: this.i18n.t('categories.toast.created'),
        life: 3000,
      });
      this.ref.close(true);
    },
    onError: () => {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('common.error'),
        detail: this.i18n.t('categories.toast.createError'),
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
