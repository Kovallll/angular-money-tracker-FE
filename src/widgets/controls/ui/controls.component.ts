import { Component, input } from '@angular/core';
import { FiltersComponent } from '@/entities/filters/ui/filters.component';
import { SorterComponent } from '@/entities/sorters/ui/sorter.component';
import { ControlsProps } from '../lib';
import { SearchComponent } from '@/entities/search/ui/search.component';

@Component({
  selector: 'controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  imports: [FiltersComponent, SorterComponent, SearchComponent],
  standalone: true,
})
export class ControlsComponent {
  withoutFilter = input(false);
  withoutSorter = input(false);
  withoutSearch = input(false);
  controlsProps = input<ControlsProps>();
}
