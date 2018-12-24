import {Component, ElementRef} from '@angular/core';
import {AppService, EmojieMap} from "./app-service";
import {combineLatest, Observable} from "rxjs";
import {FormControl} from "@angular/forms";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  fontSize: number;
  slackEmojies$: Observable<EmojieMap>;
  emojiControl: FormControl = new FormControl();

  constructor(appService: AppService, private elementRef: ElementRef) {
    this.slackEmojies$ = appService.slackEmojies;
    this.fontSize = appService.getFontSize();
    // if (!this.fontSize) {this.fontSize = 25}
    this.elementRef.nativeElement.style.setProperty('--fontsize', this.fontSize + 'px');
  }
}
