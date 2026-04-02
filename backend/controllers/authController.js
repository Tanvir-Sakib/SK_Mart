const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req,res)=>{

try{

const {name,email,password} = req.body;

const existingUser  = await User.findOne({email});

if(existingUser)
return res.status(400).json({message:"User already exists"});

const hashedPassword = await bcrypt.hash(password,10);

const user = await User.create({
name,
email,
password:hashedPassword
});

res.json({
message: "User registered successfully"
});

res.status(201).json(user);

}
catch(err){
res.status(500).json(err);
}
};

exports.loginUser = async (req,res)=>{

try{

const {email,password} = req.body;

const user = await User.findOne({email});

if(!user)
return res.status(404).json("Invalid credentials");

const isMatch = await bcrypt.compare(password,user.password);

if(!isMatch)
return res.status(401).json("Invalid credentials");

const token = jwt.sign(
{id:user._id,role:user.role},
process.env.JWT_SECRET,
{expiresIn:"7d"}
);

res.json({
token,
role: user.role,
name: user.name
});

}
catch(err){
res.status(500).json(err);
}
};