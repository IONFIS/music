import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllUsers} from "../controllers/user.controller.js";

const router = Router();
router.get('/api/users',protectRoute,getAllUsers);
//TO DO MESSEGES WITH THE USERS

  export default router;