import {Component, ElementRef} from '@angular/core';
import {AppService, EmojieMap} from "./app-service";
import {Observable} from "rxjs";
import {FormControl} from "@angular/forms";
import {first} from "rxjs/operators";
import * as Fuse from "fuse.js";
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  fontSize: number;
  slackEmojies$: Observable<Map<string, string>>;
  shownEmoji: string[];
  slackToken: string;
  emojiMap: Map<string, string>;
  emojiControl: FormControl = new FormControl();
  keys: string[] = [];
  options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
  };
  fuse: Fuse<string>;

  constructor(private appService: AppService, private elementRef: ElementRef, private snackBar: MatSnackBar) {
    this.slackEmojies$ = appService.slackEmojies;
    this.fontSize = appService.getFontSize();
    this.elementRef.nativeElement.style.setProperty('--fontsize', this.fontSize + 'px');
    this.slackToken = appService.slackToken;
    this.slackEmojies$.pipe(first()).subscribe(emojiMap => {
      this.emojiMap = emojiMap;
      this.keys = Array.from(emojiMap.keys() );
      var options = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
      };
      this.fuse = new Fuse(this.keys as ReadonlyArray<string>, options); // "list" is the item array
      this.search('a');
    })
  }


  search(value: string): void {
    let results = this.fuse.search(value);
    let emojis = results.slice(0, 16).map(res => {
      return this.emojiMap.get(this.keys[res])
    });
    this.shownEmoji =  emojis;
  }


  login(): void {
    this.slackToken = this.appService.login();
  }

  copyToClipBoard(value) {
    let text = '<img class="{{this.fontSize}}" src="{{value}}">'
    // this.copyTextToClipboard(text);
    console.log(text);
  }
}
