import { Router } from "express";
import { getAllSongs } from "../controllers/song.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getMadeForYour, getTrending, getFeatured } from "../controllers/song.controller.js";



const router = Router();
router.get('/',protectRoute,requireAdmin, getAllSongs);
router.get('/made-for-you', getMadeForYour);
router.get('/trending', getTrending);
router.get('/featured', getFeatured);

export default router;