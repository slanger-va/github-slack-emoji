import {HttpClient} from "@angular/common/http";
import {map, shareReplay} from "rxjs/operators";
import {combineLatest, Observable} from "rxjs";
import {Injectable} from "@angular/core";

export interface EmojieMap {
  [shortnames: string]: string;
}
@Injectable()
export class AppService {
  customEmojies: Observable<EmojieMap>;
  slackEmojies: Observable<EmojieMap>;
  constructor(private http: HttpClient) {
    this.customEmojies = this.getCustomeEmojies();
    this.slackEmojies = this.getSlackEmojis();
  }

  getSlackEmojis(): Observable<EmojieMap> {
    console.log('getslack');
    return this.http.get('./assets/emoji.json').pipe(map(
      ((result: any) => {
        if (result) {
          const emojiMap: {[key: string]: string} = {};
          result.map(r => {
            for(let i = 0; i < r['short_names'].length; i++) {
              emojiMap[r['short_names'][i]] = r['unified'];
            }
          });
          return emojiMap;
        }
      })),
      shareReplay(1));
  }


  getCustomeEmojies(): Observable<EmojieMap> {
    console.log('getcustom');
    return this.http.get('https://slack.com/api/emoji.list?token=xoxp-2359480181-177823687271-288633477749-5803d20640ca6d86cfda465b76aeaf44').pipe(map(
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
}
