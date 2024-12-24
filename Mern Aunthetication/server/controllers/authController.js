import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';




export const register = async(req,res)=>{
       const {name, email, password} = req.body;

       if(!name || !email || !password){
           return res.json({success:false,message: 'Missing Details'})        
        }

  try {

  const existingUser = await userModel.findOne({email})
  if(existingUser){
    return res.json({success:false,message: 'User Already Exists'})
  }   

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = new userModel({
    name,
    email,
    password: hashedPassword
    
  })
    await user.save();
    
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'7d'})
     res.cookie('token',token,{

      httpOnly: true,  //with this only http request can access the cookie
      secure: process.env.NODE_ENV === 'production',  //if NODE_ENV is production then secure is true
      sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict',
      maxAge: 7*24*60*60*1000,
    });

   // Sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to:email,
      subject: 'Welcome to GreatStack',
      text: `Thank you for registering with us. Your account has been created with email id: ${email} Name ${name}`
    }

    await transporter.sendMail(mailOptions)

    return res.json({success:true});



     
  } catch (error) {
    console.error('Error during registration:', error);
    return res.json({success:false,message: 'Error Occured'})
  }


}

export const login = async(req,res)=>{
  const {email, password} = req.body;

  if(!email || !password){
    return res.json({success:false,message: 'Missing Details'})
  }

  try {
    const user = await userModel.findOne({email})
    if(!user){
      return res.json({success:false,message: 'User Not Found'})
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
      return res.json({success:false,message: 'Invalid Credentials'})
    }
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
     res.cookie('token',token,{
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict',
      maxAge: 7*24*60*60*1000,
    })
    return res.json({success:true})

  } catch (error) {
    console.error('Error during login:', error);
    return res.json({success:false,message: 'Error Occured'})

  }
}



export const logout = async(req,res)=>{
   
  try {
    res.clearCookie('token',{
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict'
    })
    return res.json({success:true,message: 'Logged Out'})
  } catch (error) {
    console.error('Error during logout:', error);
    return res.json({success:false,message: 'Error Occured'})
  }
}


export const sendVerifyOtp = async(req,res)=>{
  try {
    const {userId} = req.body;

    const user = await userModel.findById(userId);
    if(user.isAccoundVerified){
      return res.json({success:false,message: 'Account Already Verified'})
    }

   const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Verify Your Account',
      // text:`Your OTP is ${otp}. Verify your account using this OTP.`,
      html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
    }

    await transporter.sendMail(mailOption);

    return res.json({success:true,message: 'OTP Sent Successfully'})

  } catch (error) {
    console.error('Error during sending OTP:', error);
    return res.json({success:false,message: 'Error Occured'})
  }
}


// Verify the email using the OTP
export const verifyEmail = async(req,res)=>{
  const {userId, otp} = req.body;
  if(!userId || !otp){
    return res.json({success:false,message: 'Missing Details'})
  }
  try {
 const user = await userModel.findById(userId);

 if(!user){
  return res.json({success:false,message: 'User Not Found'})
 }

 if(user.verifyOtp === ''  || user.verifyOtp !== otp){
  return res.json({success:false,message: 'Invalid OTP'})
 }


 if(user.verifyOtpExpireAt < Date.now()){
  return res.json({success:false,message: 'OTP Expired'})
 }

 user.isAccountVerified = true;
 user.verifyOtp = '';
 user.verifyOtpExpireAt = 0;

 await user.save();

 return res.json({success:true,message: 'Account Verified Successfully'})


  } catch (error) {
    return res.json({success:false,message: 'Error Occured'})
  }
}


// Check if user is authenticated
export const isAunthenticated = async(req,res)=>{
     try {
       return res.json({success:true, message: 'User is authenticated'})
     } catch (error) {
      return res.json({success:false,message: 'Error Occured'})
     }
}



// Send password Reset OTP
export const sendResetOtp = async(req,res)=>{
  const {email} = req.body;

  if(!email){
    return res.json({success:false,message:'Email is required'})
  }

  try {

    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success:false,message:'User not found'});
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Password Reset OTP',
      // text: `Your OTP for password reset is ${otp}. This OTP will expire in 15 minutes.`,
      html:PASSWORD_RESET_TEMPLATE.replace('{{otp}}', otp).replace('{{email}}', user.email)
    };

    await transporter.sendMail(mailOptions);

    return res.json({success:true,message:'OTP sent to your email'})

    

    
  } catch (error) {
    return res.json({success:false,message:error.message})
  }

}




// Reset User Password
export const resetPassword = async(req,res)=>{
  const {email, otp, newPassword} = req.body;
  if(!email || !otp || !newPassword){
    return res.json({success:false,message:'Email, OTP and new password are required'})

  }
  try {
    
  const user = await userModel.findOne({email});

  if(!user){
    return res.json({success:false,message:'User not found'});
  }

  if(user.resetOtp === "" || user.resetOtp !== otp){
    return res.json({success:false,message:'Invalid OTP'});
  }

  if(user.resetOtpExpireAt < Date.now()){
    return res.json({success:false,message:'OTP has expired'});
  }

  const hashedPassword = await bcrypt.hash(newPassword,10);

  user.password = hashedPassword;
  user.resetOtp = '';
  user.resetOtpExpireAt = 0;

  await user.save();

  return res.json({success:true,message:'Password reset successfully'})

  } catch (error) {
    return res.json({success:false,message:error.message})
  }

}