import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

app.use(express.json());
app.use(cors({ origin: ['http://localhost:3000'] }));
app.use(cookieParser());

// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('test route');
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
