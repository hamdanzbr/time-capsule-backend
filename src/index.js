const express = require('express');
const app = express()
const connectDb=require('./config/database')
const cookieParser=require('cookie-parser')
const cors=require('cors');
const { validateSignupData } = require('./utils/validation');
const User = require('./models/userSchema');
const bcrypt=require('bcrypt')
const validator=require('validator')

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, 
}))

app.use(express.json())
app.use(cookieParser())

app.post('/signup', async (req, res) => {
    try {
        validateSignupData(req);
        const { username, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new Error("User already exists");
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        await user.save();
        
        const token = await user.getJwtToken();
        
        res.cookie("token", token, { expires: new Date(Date.now() + 9000000), httpOnly: true });
        
        const { password: _, ...userData } = user.toObject();
        
        res.json({ message: 'User added successfully and logged in', data: { ...userData, token } });
        
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong: ' + error.message });
    }
});



app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validator.isEmail(email)) throw new Error("Invalid email");

        const user = await User.findOne({ email });
        if (!user) throw new Error("Invalid email or password");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error("Invalid email or password");

        const token = await user.getJwtToken();

        res.cookie("token", token, { expires: new Date(Date.now() + 9000000), httpOnly: true });

        const { password: _, ...userData } = user.toObject(); 
        res.json({ message: 'Login successful', token, data: userData });
        
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong: ' + error.message });
    }
});


app.post('/logout',(req,res)=>{
    res.cookie('token',null,{expires:new Date(Date.now())})
    res.send('logout successful')
})

connectDb().then(() => { 
    console.log('database connected to server');
    app.listen(4000, console.log('server running on 4000'))
}).catch((err) => {
    console.error('database connection failed', err.message);

})