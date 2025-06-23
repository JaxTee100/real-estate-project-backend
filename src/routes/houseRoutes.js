import { createHouse, getAllHouses, getHouseByID, updateHouse, deleteHouse, clientHouses } from '../controllers/houseController.js';
import { authenticateJwt } from '../middleware/authMiddleware.js';
import {upload} from '../middleware/uploadMiddleware.js'

import express from 'express';

const router = express.Router();


router.post('/create-new-house', upload.array('images', 5),createHouse);
router.get('/get-all-houses',  getAllHouses);
router.get('/get-house/:id', getHouseByID);
router.put('/update-house/:id',  upload.array('images', 5), updateHouse); // Assuming createHouse can also handle updates
router.delete('/delete-house/:id',  deleteHouse); // Assuming you have a deleteHouse controller

router.get('/client-houses', clientHouses)



export default router;