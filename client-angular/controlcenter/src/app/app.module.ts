import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OverlayComponent } from './overlay/overlay.component';
import { EnvComponent } from './env/env.component';

import { MatCardModule, MatProgressBarModule, MatSnackBarModule } from '@angular/material';
import { MatGridListModule } from '@angular/material/grid-list';

import { HealthComponent } from './health/health.component';
import { MatButtonModule } from '@angular/material/button';
import { FredComponent } from './fred/fred.component';
import { ChillMusicVideoComponent } from './chill-music-video/chill-music-video.component';
import { RelaxAndBreatheComponent } from './relax-and-breathe/relax-and-breathe.component';
import { EarthComponent } from './earth/earth.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    OverlayComponent,
    EnvComponent,
    HealthComponent,
    ChillMusicVideoComponent,
    RelaxAndBreatheComponent,
    EarthComponent,
    FredComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
