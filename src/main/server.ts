import { Framework } from './frameworks';

const start = async (): Promise<void> => {
  await Framework.initializeExpress();
};

start();
