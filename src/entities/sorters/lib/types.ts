import { SelectOption } from '@/entities/select/lib';
import { Signal } from '@angular/core';

export type Sorter = {
  field: string;
  order: 'asc' | 'desc';
};

export type SortersProps = {
  sortersFields: SortersField[];
};

export type DialogData = {
  categoryOptions: Signal<SelectOption[]>;
};

export type SortersField = { field: string; name: string };
