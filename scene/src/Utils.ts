import { getCurrentRealm } from "@decentraland/EnvironmentAPI";
import { getUserData  } from "@decentraland/Identity"
import { WHITEBOARD_APP_URL, WHITEBOARD_HTTP, WHITEBOARD_WS } from "./Constants";

export function parseURL(url: string) {
    let newURL = url.trim()
  
    if (url.substr(0, 7) == 'http://') {
      newURL = 'https://' + url.substring(7).trim()
    } else if (url.substr(0, 8) != 'https://') {
      newURL = 'https://' + url.trim()
    }
  
    return newURL
  }

  export async function getWSUrl(service?: string, subservice?: string): Promise<string> {
    const userData = await getUserData();
    const realm = await getCurrentRealm();
    return `${WHITEBOARD_WS}/${service ? service + '/' : ''}${realm.displayName}${subservice ? '/' + subservice : ''}?userId=${encodeURIComponent(userData.userId)}&userName=${encodeURIComponent(userData.displayName)}`;
  }

  export async function getHTTPUrl(service?: string, subservice?: string): Promise<string> {
    const userData = await getUserData();
    const realm = await getCurrentRealm();
    return `${WHITEBOARD_HTTP}/${service ? service + '/' : ''}${realm.displayName}${subservice ? '/' + subservice : ''}?userId=${encodeURIComponent(userData.userId)}&userName=${encodeURIComponent(userData.displayName)}`;
  }

  export async function getAppUrl(): Promise<string> {
    const userData = await getUserData();
    const realm = await getCurrentRealm();
    return `${WHITEBOARD_APP_URL}?realm=${realm.displayName}&userId=${userData.userId}&userName=${userData.displayName}`;
  }

  export function padStart(str: string, length: number, char: string): string {
    let strOut = str;
    while (strOut.length < length) {
      strOut = char + strOut;
    }
    return strOut;
  }