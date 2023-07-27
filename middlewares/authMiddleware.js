import  jwt  from 'jsonwebtoken';
import userModel from '../model/user.js';



var checkUserAuth= async(req, res,next) =>{
    let token
    const {authorization}=req.headers
    if(authorization && authorization.startsWith('Bearer')){
        try {
            token =authorization.split(' ')[1]

            //verify token 
            const {userID}=jwt.verify(token,process.env.JWT_SECRET)
            //getting user from token 
            req.user=await userModel.findById(userID).select('-password')
            next()
        } catch (error) {
            res.status(401).send({"status":"failed" , "msg":"unauthorised user"})
            
        }
    }
    if(!token){
        res.status(401).send({"status":"failed" , "msg":"unauthorised user,no token"})
    }
}

export default checkUserAuth