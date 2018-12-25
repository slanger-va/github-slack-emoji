import {Component, ElementRef} from '@angular/core';
import {AppService, EmojieMap} from "./app-service";
import {Observable} from "rxjs";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  fontSize: number;
  slackEmojies$: Observable<EmojieMap>;
  slackToken: string;
  emojiControl: FormControl = new FormControl();

  constructor(private appService: AppService, private elementRef: ElementRef) {
    this.slackEmojies$ = appService.slackEmojies;
    this.fontSize = appService.getFontSize();
    this.elementRef.nativeElement.style.setProperty('--fontsize', this.fontSize + 'px');
    this.slackToken = appService.slackToken;
  }

  login(): void {
    this.slackToken = this.appService.login();
  }
}
