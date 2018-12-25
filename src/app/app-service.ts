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
  slackEmojies: Observable<EmojieMap>;
  slackToken = localStorage.getItem('slackToken');
  constructor(private http: HttpClient) {
    this.slackEmojies = this.getSlackEmojis();
  }

  getSlackEmojis(): Observable<EmojieMap> {
    return this.http.get('https://slack.com/api/emoji.list?token='+ this.slackToken).pipe(map(
      ((result: any) => {
        if (result) {
          const emoji = result.emoji;
          const paesMap: {[key: string]: string} = {};
          for(let key in emoji) {
            if (key.includes('alias:')) {
              key = key.replace('alias:', '');
            }
            paesMap[key] = emoji[key]
          }
          return paesMap;
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
    console.log('auth');
    let tk = chrome.extension.sendMessage({name: 'authenticateTeam'}, function (otherResponse) {
    });
    if(tk) {
      localStorage.setItem('slackToken', tk['slackToken']);
      this.slackToken = tk;
      return tk;
    }
  }
}
