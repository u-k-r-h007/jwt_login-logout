import  express  from "express";
const router= express.Router();
import userController from '../controllers/userController.js'
import checkUserAuth from "../middlewares/authMiddleware.js"

//route level middleware
router.use('/changepassword',checkUserAuth)
router.use('/profile',checkUserAuth)

//public routes
router.post('/register', userController.userRegistration)
router.post('/login', userController.userLogin)
router.post('/reset', userController.sendUserPasswordResetEmail)
router.post('/reset-password/:id/:token', userController.userPasswordReset)


//private routes
router.post('/changepassword', userController.changeUserPaasword)
router.get('/profile', userController.LoggedUserData)



export default router