import express from 'express';
import { getStockData } from '../controllers/stockController.js';

const router = express.Router();

router.get('/:symbol', getStockData);

export default router;

