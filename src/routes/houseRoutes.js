import { createHouse, getAllHouses, getHouseByID, updateHouse, deleteHouse, clientHouses } from '../controllers/houseController.js';
import { authenticateJwt } from '../middleware/authMiddleware.js';
import {upload} from '../middleware/uploadMiddleware.js'

import express from 'express';

const router = express.Router();


router.post('/create-new-house', authenticateJwt , upload.array('images', 5),createHouse);
router.get('/get-all-houses',authenticateJwt, getAllHouses);
router.get('/get-house/:id', authenticateJwt, getHouseByID);
router.put('/update-house/:id', authenticateJwt, upload.array('images', 5), updateHouse); // Assuming createHouse can also handle updates
router.delete('/delete-house/:id', authenticateJwt, deleteHouse); // Assuming you have a deleteHouse controller

router.get('/client-houses',authenticateJwt, clientHouses)



export default router;