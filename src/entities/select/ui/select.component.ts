import { Component, input, output } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { SelectOption } from '../lib';

@Component({
  selector: 'select-component',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  standalone: true,
  imports: [MatSelectModule],
})
export class SelectComponent {
  options = input.required<SelectOption[]>();
  value = input.required<string | null>();
  valueChange = output<string>();
  disabled = input<boolean>(false);

  handleSelectionChange(value: string) {
    this.valueChange.emit(value);
  }
}
