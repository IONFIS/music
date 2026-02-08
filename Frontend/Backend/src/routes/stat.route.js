import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getStat } from "../controllers/stat.controller.js";



const router = Router();
router.get("/",protectRoute,requireAdmin,getStat);

export default router;