import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { loadRemoteEntry, loadRemoteModule } from '@angular-architects/module-federation';

@Component({
  selector: 'app-react-wrapper',
  standalone: true,
  template: `<div #host></div>`,
})
export class ReactWrapperComponent implements OnInit, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;
  private api: { mount: (el: HTMLElement) => void; unmount?: () => void } | undefined;

  async ngOnInit() {
    await loadRemoteEntry('http://localhost:3002/remoteEntry.js', 'mct');

    const mod = await loadRemoteModule({
      type: 'script',
      remoteName: 'mct',
      exposedModule: './reactApp',
    });

    this.api = mod && 'default' in mod ? mod.default : mod;

    if (!this.api || typeof this.api.mount !== 'function') {
      console.error('Remote API не содержит mount():', this.api);
      return;
    }
    this.api.mount(this.host.nativeElement);
  }

  ngOnDestroy() {
    this.api?.unmount?.();
  }
}
