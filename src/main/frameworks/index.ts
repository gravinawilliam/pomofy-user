import gracefulShutdown from 'http-graceful-shutdown';

import { ExpressFramework } from './express/app';

export class Framework {
  public static async initializeExpress(): Promise<void> {
    const express = new ExpressFramework();
    const server = await express.execute();

    gracefulShutdown(server, {});
  }
}
