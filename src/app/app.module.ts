import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule, ToastModule],
  providers: [MessageService],
  bootstrap: [AppComponent],
})
export class AppModule {}
