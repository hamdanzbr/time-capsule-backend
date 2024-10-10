const validator=require('validator')

const validateSignupData=(req)=>{
    const {username,email,password}=req.body
    if(!username||!email||!password){
        throw new Error("All fields are required");
        
    }else if(!validator.isEmail(email)){
        throw new Error("email id is invalid");
        
    }else if(!validator.isStrongPassword(password)){
        throw new Error("password is invalid");
        
    }

}

module.exports={validateSignupData}