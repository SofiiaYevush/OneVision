import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth';
import * as ctrl from './chat.controller';

const router = Router();

router.use(requireAuth);

router.post('/conversations', ctrl.initConversation);
router.get('/conversations', ctrl.listConversations);
router.get('/conversations/:id', ctrl.getConversation);
router.get('/conversations/:id/messages', ctrl.getMessages);
router.post('/conversations/:id/messages', ctrl.sendMessage);

export default router;