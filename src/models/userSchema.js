const mongoose=require('mongoose')
const validator=require('validator')
const jwt=require('jsonwebtoken')
const dotenv = require('dotenv');

dotenv.config();
 
const userSchema=mongoose.Schema({
    username:{
        type:String,
        required:true,
        minLength:4,
        maxLength:20
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("password not valid"+value);
                
            }
        }
    }
},{timestamps:true})

userSchema.methods.getJwtToken=async function(){
    const user=this
    const token=await jwt.sign({_id:user._id},process.env.JWT_SECERET,{expiresIn:'7d'})
    return token;
}

const User=mongoose.model('User',userSchema)
module.exports=User