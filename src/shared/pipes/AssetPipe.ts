import { assetUrl } from '@/single-spa/asset-url';
import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@/environments/environment';
@Pipe({ name: 'assetUrl' })
export class AssetUrlPipe implements PipeTransform {
  transform(value: string): string {
    return environment.SPA_RUN ? assetUrl(value) : 'assets/' + value;
  }
}
