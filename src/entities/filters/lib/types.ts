import { SelectOption } from '@/entities/select/lib';
import { Signal } from '@angular/core';

export type FilterProps = {
  filterFields: FiltersField[];
  data: FilterData[];
};

export type Filter = {
  category: string;
  value: string;
  valueOptions: SelectOption[];
  id: number;
};

export type DialogData = {
  categoryOptions: Signal<SelectOption[]>;
  filterFields: Signal<FiltersField[]>;
  data: Signal<FilterData[]>;
};

export type FiltersField = { field: string; name: string };
export type FilterData = { id: number; [key: string]: any };
