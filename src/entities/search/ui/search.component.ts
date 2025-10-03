import { Component, inject, input, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../services/search.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'search-input',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [MatInput, MatFormFieldModule, ReactiveFormsModule],
  encapsulation: ViewEncapsulation.None,
})
export class SearchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  searchField = input.required<string>();
  placeholder = input<string>('Search...');
  search = signal('');

  form = new FormGroup({
    search: new FormControl(''),
  });

  constructor(private searchService: SearchService) {}

  onSearch() {
    this.searchService.onSearch(this.searchField());
  }

  onChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.searchService.setSearch(input.value);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const search = this.searchService.getSearchFromUrlParams(params);
      console.log(search, 'search');
      if (search) {
        this.search.set(search);
        this.form.get('search')?.setValue(search);
      }
    });
  }
}
