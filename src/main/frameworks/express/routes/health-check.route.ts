import { Request, Response, Router } from 'express';

import { HttpStatusCode } from '@shared/utils/http-status-code.util';

const router: Router = Router();

router.get('/', (_request: Request, response: Response) => {
  response.status(HttpStatusCode.OK).json({
    message: '🚀 To infinity and beyond!'
  });
});

export default router;
