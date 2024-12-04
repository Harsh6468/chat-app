import { generateToken } from "../lib/utils.js";
import User from "../modules/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"

export const signup = async ( req, res )=>{
    const {fullName, email, password} = req.body;
    try{
        if (!fullName || !email || !password){
            return res.status(400).json({ message: "All fields are required."});
        }

        if (password.length < 6){
            return res.status(400).json({ message: "Password must be atleast 6 characters."});
        }
        const user = await User.findOne( {email} );
        if (user){ return res.status(400).json({ message: "Email already exists."}); }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })
        if (newUser){
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: fullName,
                email: email,
                profilePic: newUser.profilePic,
            });
        }
        else{
            return res.status(400).json({ message: "invalid user data"});
        }
    }
    catch (error){
        console.log("Error in signup controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const login = async ( req, res )=>{
    const { email, password } = req.body;
    try{
        if (!email || !password){
            return res.status(400).json({ message: "Invalid Credentials."});
        }
        
        const user = await User.findOne({ email });
        
        if(!user){
            return res.status(400).json({ message: "Invalid Credentials."});
        }
        
        const isCorrectUser = await bcrypt.compare(password, user.password);
        
        if(!isCorrectUser){
            return res.status(400).json({ message: "Invalid Credentials."});
        }
    
        generateToken(user._id, res);
    
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        })
    }
    catch (error){
        console.log("Error in login controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const logout = ( req, res )=>{
    try{
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Logout Succesfully."})
    } catch (error){
        console.log("Error in logout controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const updateProfile = async ( req, res ) => {
    try {
        const {profilePic} = req.body;
        if(!profilePic){
            return res.status(400).jsn({message: "Profile pic is required"})
        }
        const userId = req.user._id;
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new: true});

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const checkAuth = async ( req, res ) => {
    try{
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};