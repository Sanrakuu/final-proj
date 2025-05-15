import express from 'express';
import { makeEgg, updateEggStatus, deleteEgg, getEggs } from '../controllers/eggs.js';

const router = express.Router();

router.post('/', makeEgg)
router.get('/', getEggs);
router.patch('/:id', updateEggStatus);
router.delete('/:id', deleteEgg);

export default router;

