import endent from 'endent';
import figlet from 'figlet';

import { APP_CONFIG, APP_INFO, GLOBAL_CONFIG } from '@main/configs/environments.config';

export const showBanner = () => {
  const banner = endent`Application started successfully!
      ${figlet.textSync(APP_INFO.APP_NAME)}
       Name: ${APP_INFO.APP_NAME}
       Description: ${APP_INFO.APP_DESCRIPTION}
       Version: ${APP_INFO.APP_VERSION}
       Port: ${APP_CONFIG.PORT}
       Docs Path: ${APP_CONFIG.DOCS_PATH}
       Environment: ${GLOBAL_CONFIG.ENVIRONMENT}
       Author: ${APP_INFO.AUTHOR_NAME}
    `;
  console.log(banner);
};
