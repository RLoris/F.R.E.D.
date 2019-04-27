import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OverlayComponent } from './overlay/overlay.component';
import { EnvComponent } from './env/env.component';

import {MatCardModule, MatProgressBarModule, MatSnackBarModule} from '@angular/material';
import {MatGridListModule} from '@angular/material/grid-list';

import { HealthComponent } from './health/health.component';
import {MatButtonModule} from '@angular/material/button';
import { ChillMusicVideoComponent } from './chill-music-video/chill-music-video.component';
import { RelaxAndBreatheComponent } from './relax-and-breathe/relax-and-breathe.component';

@NgModule({
  declarations: [
    AppComponent,
    OverlayComponent,
    EnvComponent,
    HealthComponent,
    ChillMusicVideoComponent,
    RelaxAndBreatheComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
