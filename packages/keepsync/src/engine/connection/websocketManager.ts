import {ConnectionOptions} from '../types.js';
import {logger} from '../../utils/logger.js';
import {Repo, PeerId} from '@tonk/automerge-repo-fork';
import {BrowserWebSocketClientAdapter} from '@automerge/automerge-repo-network-websocket';

export class WebSocketManager {
  private repo: Repo;
  private url: string;
  private isOnline: boolean = false;
  private onStatusChange: (isOnline: boolean) => void = () => {};
  private adapter: BrowserWebSocketClientAdapter;

  constructor(
    options: ConnectionOptions,
    onStatusChange?: (isOnline: boolean) => void,
  ) {
    this.url = options.url;

    if (onStatusChange) this.onStatusChange = onStatusChange;

    // Create the WebSocket adapter
    this.adapter = new BrowserWebSocketClientAdapter(this.url);

    const originalSend = this.adapter.send.bind(this.adapter);
    this.adapter.send = (message: any) => {
      logger.debug('WebSocket sending message: ', message);
      return originalSend(message);
    };

    // Create the repo with the adapter
    this.repo = new Repo({
      network: [this.adapter as any],
      peerId: (options.clientId ||
        crypto.randomUUID?.() ||
        Math.random().toString(36).substring(2)) as unknown as PeerId,
    });
  }

  private setOnlineStatus(isOnline: boolean): void {
    if (this.isOnline !== isOnline) {
      this.isOnline = isOnline;
      logger.info(
        `Connection status changed to: ${isOnline ? 'online' : 'offline'}`,
      );
      this.onStatusChange(isOnline);
    }
  }

  close(): void {
    try {
      this.setOnlineStatus(false);
    } catch (error) {
      logger.error('Error closing WebSocket connection:', error);
    }
  }

  // Expose the repo for direct access if needed
  getRepo(): Repo {
    return this.repo;
  }
}
