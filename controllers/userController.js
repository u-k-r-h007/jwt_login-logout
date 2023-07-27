import userModel from '../model/user.js';
import  bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import transporter from '../config/emailConfig.js';



class userController{

    static userRegistration=async(req, res, next) =>{
        const {name,email,password,password_confirmation,tc}=req.body
        const user=await userModel.findOne({email:email});
        if(user){
            res.send({"status":"failed", "msg":"email already registered"})
        }
        else{
            if(name && email && password && password_confirmation && tc){
              if(password === password_confirmation){
            const salt=await bcrypt.genSalt(10)
            const hash=await bcrypt.hash(password,salt)

                 try {
                    const registeredUser=new userModel({
                        name,email,password:hash,tc
                      })
                      await registeredUser.save()
                      //creating jwt token when user is registered
                      //now getting just created user email into a variable
                      const saved_user=await userModel.findOne({email:email})
                      //generate jwt token
                      const token=jwt.sign({
                        userID:saved_user._id},
                        process.env.JWT_SECRET, 
                        {expiresIn:'2d'}

                      )
                      res.send({"status":"success","msg": "users registered successfully","token":token})
                  }
                  catch (error) {
                    res.status(400).send({error, "msg":"unable to register"})
                 }}
              else{
                res.send({"status":"failed", "msg":"password and confirmation password do not match"})
              }
            }else{
                res.send({"status":"failed", "msg":"all fields are required"})
            }
        }



    }

//login

    static userLogin=async(req, res, next)=>{
        try {
            const {email,password}=req.body;
            if(email && password){
                const user=await userModel.findOne({email:email});
                if(user != null){
                  const isMatch=await bcrypt.compare(password, user.password)
                  if((user.email===email) && isMatch)
                  {     const token=jwt.sign({
                    userID: user._id
                   }, process.env.JWT_SECRET, 
                   {expiresIn:'2d'}
                   )
                       res.status(201).send({"status":"success", "msg":"you have logged in successfully",token})
                      
                      
                  }
                  else{
                    res.status(401).send({"status":"failed", "msg":"email or password is not valid"})
                  }
                }
                else{
                    res.status(401).send({"status":"failed", "msg":"email not registered"})
                }
            }else{
                res.status(400).send({"status":"failed", "msg":"all fields are required"})
            }
        } catch (error) {
            res.status(500).send({error})
        }
    }

//change password
static changeUserPaasword= async(req, res, next)=> {
  const {password ,password_confirmation} = req.body

  if(password ,password_confirmation){
     if(password === password_confirmation){
          const salt= await bcrypt.genSalt(10)
          const newHash= await bcrypt.hash(password,salt)
       await userModel.findByIdAndUpdate(req.user._id, {$set:{
        password:newHash
       }})
       res.status(201).send({"status":"success", "msg":"password successfully changed"})
     }
     else{
      res.status(400).send({"status":"failed", "msg":"password dosen't match"})
     }
  }
  else{
    res.status(400).send({"status":"failed", "msg":"all fields are required"})
  }
}


//logged user data

static LoggedUserData= async (req, res) => {
  res.send({"user":req.user})
}

//creating link to reset password
static sendUserPasswordResetEmail=async (req, res) => {
  const {email} = req.body
  if(email){
  const user=await userModel.findOne({email: email})
  
  if(user){
    const secret=user._id + process.env.JWT_SECRET
    const token= jwt.sign({userID: user._id},secret,{expiresIn:"10m"})
    const link=`http://localhost:3000/api/user/pass-reset/${user._id}/${token}`
    console.log(link)

    //sending email
    let info= await transporter.sendMail({
      from:process.env.EMAIL_FROM,
      to:user.email,
      subject:"password reset link",
      html:`<h1><a href=${link}>click here</a> to reset your password</h1>`
    })
    res.send({"status":"success", "message":"link is sent to you email address",info})
  }
  else{
    req.send({"status":"failed", "message":"email not registered"})
  }
  }
  else{
    req.send({"status":"failed", "message":"email is required"})
  }
}

static userPasswordReset= async (req, res) => {
  const {password, password_confirmation} = req.body
  const {id,token}=req.params
  const user= await userModel.findById(id)
  const new_secret= user._id + process.env.JWT_SECRET
  try {
    jwt.verify(token, new_secret)
    if(password && password_confirmation){
      if(password === password_confirmation){
         const salt=await bcrypt.genSalt(10)
         const new_hash=await bcrypt.hash(password ,salt )
         await userModel.findByIdAndUpdate(user._id, {$set:{
          password:new_hash}})
          res.send({"status":"success", "message":"password successfully reset"})
      }else{
       res.send({"status":"failed", "message":"password and confirm password dosen't match"})
      }
   }
   else{
     res.send({"status":"failed", "message":"All fields are required"})
   }

  } catch (error) {
    res.send({"status":"failed", "message":"invalid token"})
  }
 
}

}

export default  userController