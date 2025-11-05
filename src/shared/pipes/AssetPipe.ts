import { assetUrl } from '@/single-spa/asset-url';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'assetUrl' })
export class AssetUrlPipe implements PipeTransform {
  transform(value: string): string {
    return assetUrl(value);
  }
}
