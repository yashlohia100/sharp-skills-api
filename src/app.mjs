import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import courseRouter from '../routes/courseRoutes.mjs';
import userRouter from '../routes/userRoutes.mjs';
import authRouter from '../routes/authRoutes.mjs';
import AppError from '../utils/appError.mjs';
import globalErrorHandler from '../controllers/errorController.mjs';
import purchaseRouter from '../routes/purchaseRoutes.mjs';
import reviewRouter from '../routes/reviewRoutes.mjs';
import config from '../config.mjs';

const app = express();

/*******************************************************************************
 * Middlewares
 ******************************************************************************/

app.use(morgan('dev'));

app.use(express.static('public'));

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);

// app.use((req, res, next) => {
//   // res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   next();
// });

/*******************************************************************************
 * Routes
 ******************************************************************************/

app.use('/api/courses', courseRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/purchases', purchaseRouter);
app.use('/api/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  const myError = new AppError('Route does not exist', 404);
  next(myError);
});

/*******************************************************************************
 * Error handler
 ******************************************************************************/

app.use(globalErrorHandler);

export default app;
