import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AssetPathPipe } from '@/shared/pipes/asset-path.pipe';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [AssetPathPipe],
  templateUrl: './app-logo.component.html',
  styleUrls: ['./app-logo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLogoComponent {
  /** sm = 48px (sidebar), md = 56px (auth pages) */
  size = input<'sm' | 'md'>('md');
}
