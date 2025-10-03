import { FilterProps } from '@/entities/filters/lib';
import { SearchProps } from '@/entities/search/lib';
import { SortersProps } from '@/entities/sorters/lib';

export type ControlsProps = {
  filterProps: FilterProps;
  sortersProps: SortersProps;
  searchProps: SearchProps;
};
