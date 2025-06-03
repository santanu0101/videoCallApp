import { Router } from "express";
import { Login, Logout, Signup } from "../controllers/auth.controller.js";
import isLogin from "../middlewares/isLogin.js";

const router = Router();

router.post('/signup', Signup);
router.post('/login', Login);
router.post('/logout', isLogin, Logout);


export default router;