import { Router } from 'express';
import authRouter from './auth';
import studentRouter from './students';
import analyticsRouter from './analytics';
import progressRouter from './progress';
import worldsRouter from './worlds';
import rewardsRouter from './rewards';
import subscriptionsRouter from './subscriptions';

const router = Router();

router.use('/auth', authRouter);
router.use('/students', studentRouter);
router.use('/analytics', analyticsRouter);
router.use('/parents', analyticsRouter);
router.use('/progress', progressRouter);
router.use('/worlds', worldsRouter);
router.use('/rewards', rewardsRouter);
router.use('/subscriptions', subscriptionsRouter);

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Math Adventure Quest API' });
});

export default router;
