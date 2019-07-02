import {Component, ElementRef} from '@angular/core';
import {AppService, EmojieMap} from './app-service';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {first} from 'rxjs/operators';
import * as Fuse from 'fuse.js';
import {MatSnackBar} from '@angular/material';

export interface Emoji {
  name: string
  src: string

}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  fontSize: number;
  slackEmojies$: Observable<Map<string, string>>;
  shownEmoji: Emoji[] = [];
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
      this.keys = Array.from(emojiMap.keys());
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
    if (!value) {
      value = 'a';
    }
    let results = this.fuse.search(value);
    let emojis = results.slice(0, 16).map(res => {
      return {
        name: this.keys[res],
        src: this.emojiMap.get(this.keys[res])
      } as Emoji
    });
    this.shownEmoji = emojis;
  }


  login(): void {
    this.slackToken = this.appService.login();
  }

  copyToClipBoard(value: Emoji) {
    let text = '<img height="' + this.fontSize + '" src="' + value.src + '" title="' + value.name + '">';
    this.copy(text);
  }

  copy(item: string): void {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (item));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
    this.snackBar.open('Copied to Clipboard', null, {
      duration: 1000,
    });
  }
}
