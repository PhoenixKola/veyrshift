export type PlayerScreen='title'|'hub'|'character'|'forms'|'records'|'settings'|'credits'|'game';
export type ScreenEvent={type:'new-run'}|{type:'start-run'}|{type:'back'}|{type:'return-to-title'}|{type:'open';screen:PlayerScreen};
export function transitionScreen(current:PlayerScreen,event:ScreenEvent):PlayerScreen{
 switch(event.type){
  case 'new-run':return current==='title'?'hub':current;
  case 'start-run':return current==='hub'||current==='character'?'game':current;
  case 'return-to-title':return 'title';
  case 'open':return event.screen;
  case 'back':return current==='hub'?'title':current==='title'?'title':'hub';
 }
}
