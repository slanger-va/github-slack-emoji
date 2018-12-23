import { Component } from '@angular/core';
import {AppService, EmojieMap} from "./app-service";
import {Observable} from "rxjs";
import {FormControl} from "@angular/forms";
import {element} from "protractor";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  fontSize: number  = 14;
  slackEmojies$: Observable<EmojieMap>;
  customEmojies$: Observable<EmojieMap>;
  emojiControl: FormControl = new FormControl();

  constructor(appService: AppService) {
    this.slackEmojies$ = appService.slackEmojies;
    this.customEmojies$ = appService.customEmojies;
    const img = document.querySelector('img');
    if(img) {
      img[0].style.setProperty('$imageSize', this.fontSize + 'px')
    }
  }

}
