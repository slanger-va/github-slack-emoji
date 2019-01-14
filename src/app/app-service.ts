import {HttpClient} from "@angular/common/http";
import {map, shareReplay} from "rxjs/operators";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";

declare const chrome;

export interface EmojieMap {
  [shortnames: string]: string;
}

@Injectable()
export class AppService {
  slackEmojies: Observable<Map<string, string>>;
  slackToken = localStorage.getItem('slackToken');
  constructor(private http: HttpClient) {
    this.slackEmojies = this.getSlackEmojis();
  }

  getSlackEmojis(): Observable<Map<string, string>> {
    return this.http.get('https://slack.com/api/emoji.list?token='+ this.slackToken).pipe(map(
      ((result: any) => {
        if (result) {
          const emojiMap = new Map();
            const emoji = result.emoji;
            for (let key in emoji) {
              while (emoji[key] && emoji[key].includes('alias:')) {
                key = emoji[key].replace('alias:', '');
              }
              if (emoji[key]) {
                emojiMap.set(key, emoji[key]);
              }
            }
            return emojiMap;
        } else {
          return null;
        }
      })),
      shareReplay(1));
  }

  getFontSize(): number {
    return +localStorage.getItem('fontSize');
  }

  login(): string {
    let tk = chrome.extension.sendMessage({name: 'authenticateTeam'}, function (otherResponse) {
    });
    if(tk) {
      localStorage.setItem('slackToken', tk['slackToken']);
      this.slackToken = tk;
      return tk;
    }
  }
}
