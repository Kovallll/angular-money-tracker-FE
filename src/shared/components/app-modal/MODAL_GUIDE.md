# Руководство по модальным окнам

Все модалки в приложении используют единые стили: скругления, бордер, тёмный фон, единообразные инпуты и кнопки.

## Быстрый старт — новая модалка

### Вариант 1: PrimeNG DynamicDialog (категории, подписки, транзакции, карты)

```ts
this.dialogService.open(YourModalComponent, {
  header: 'Your Title',
  styleClass: 'modal', // обязательно!
  closable: true,
  dismissableMask: true,
});
```

Шаблон модалки:

```html
<form class="app-modal-form" (ngSubmit)="onSubmit()">
  <div class="form-fields">
    <div class="field">
      <label for="name">Name</label>
      <input pInputText id="name" [(ngModel)]="data.name" name="name" />
      <div class="error-slot"></div>
    </div>
    <!-- или form-row для двух колонок -->
  </div>
  <div class="actions">
    <app-button appearance="secondary" (buttonClick)="close()">Cancel</app-button>
    <app-button appearance="primary" [type]="'submit'">Save</app-button>
  </div>
</form>
```

### Вариант 2: MatDialog (цель редактирования, фильтры, сортировка)

Используй `app-modal-shell` для контейнера. Кнопки задаются пропсами:

```html
<app-modal-shell
  title="Edit Something"
  [showDelete]="true"
  [showCancel]="true"
  [showSave]="true"
  [saveDisabled]="form.invalid"
  saveLabel="Save"
  (closeRequest)="onCancel()"
  (deleteRequest)="onDelete()"
  (cancelRequest)="onCancel()"
  (saveRequest)="onSave()"
>
  <form #form="ngForm" class="app-modal-form" (ngSubmit)="onSave()">
    <!-- поля -->
  </form>
</app-modal-shell>
```

Пропсы кнопок: `showDelete`, `showCancel`, `showSave`, `deleteLabel`, `cancelLabel`, `saveLabel`, `saveDisabled`.
Колбеки: `deleteRequest`, `cancelRequest`, `saveRequest`, `closeRequest`.

## Компоненты

- **AppModalShellComponent** — обёртка с заголовком, контентом и футером с кнопками (Delete, Cancel, Save). Для MatDialog.
- **AppModalFieldComponent** — поле с label + control + error. Опционально.
- **app-price-currency-field** — сумма + валюта (с опцией `lockCurrency`).

## Стили

- `_modal-form.scss` — глобальные стили для `.app-modal-form`, `.field`, инпутов, кнопок.
- `styles.scss` — общие стили для `.p-dialog.modal` (border-radius 16px, border, тёмный фон).
- Фон заголовка ($light-primary) единый для всех модалок — и для p-dialog, и для app-modal-shell.

## Классы

- `app-modal-form` — на форме
- `form-fields` — сетка полей (1 или 2 колонки)
- `form-row` — ряд из 2 полей
- `field` / `form-field` — одно поле (label + input + error-slot)
- `error-slot` — место под ошибку (фикс. высота)
- `actions` — блок кнопок
