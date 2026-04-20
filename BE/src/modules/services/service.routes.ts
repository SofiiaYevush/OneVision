import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { createServiceDto, updateServiceDto, serviceQueryDto } from './service.dto';
import * as ctrl from './service.controller';

const router = Router();

router.get('/', validate(serviceQueryDto, 'query'), ctrl.listServices);
router.get('/:id', ctrl.getService);

router.use(requireAuth, requireRole('performer'));

router.post('/', validate(createServiceDto), ctrl.createService);
router.get('/my/list', ctrl.listMyServices);
router.patch('/:id', validate(updateServiceDto), ctrl.updateService);
router.delete('/:id', ctrl.deleteService);
router.patch('/:id/toggle', ctrl.toggleService);

export default router;