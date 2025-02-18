import User from "../model/user.js"
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const SALT_ROUNDS=10
export const updateOperator = async(req,res)=>{
    const {id}=req.params;
    const user=req.body

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({success:false, message:"Invalid User ID"})
    }
    
    try{
        const updatedUser = await User.findByIdAndUpdate(id,user,{new:true});
        res.status(200).json({success:true, data:updatedUser});
    }
    catch(error)
    {
        res.status(500).json({success:false, message:"Server error"})
    }

}
//////////////////////////////////////////////////////////////////////////////

export const getAllOperators = async (req,res)=>{
    try{
        const users = await User.find({});
        res.status(200).json({success:true, data:users});
    }
    catch(error)
    {
        
        res.status(500).json({success:false, message:"Server error"})
    }

}

//////////////////////////////////////////////////////////////////////

export const createOperator =async (req,res)=>{
    const userr=req.body

    if(!userr.name || !userr.email || !userr.phoneNum || !userr.role)
    {
        return res.status(400).json({success:'Failure',message:'Please provide all fields'})
    }
    const user = new User(userr)

    try{
        //let data = await db.collection("users").insertOne(mongoObject)
        //response.json(data)
           //res.send(user)
           await user.save();
           res.status(201).json({success:true, data:user})
        }
catch(error)
    {
            //console.error("Error in creating :", error.message)
            return res.status(500).json({success:'Failure',message:'Server error'})
    }
}



//////////*******************************************//////////////////////////
export const createAnOperator= async (req,res)=>{
    const { name,email, phoneNum } = req.body;
    const userr=req.body;
    if(!name || !email || !phoneNum )
    {
        return res.status(400).json({success:'Failure',message:'Please provide all fields'})
    }

    const user = await User.findOne({ email });
    if(user)
    {
        //Email exist already
        return res.status(500).json({success:'Failure',message:'Email address already used.'})
    }
    else{

        const user = new User(userr)
        // Hash the password
        const hashedPassword = await bcrypt.hash('yourpassword', SALT_ROUNDS);

        // Create the admin user
        const operator = new User({
            name: userr.name,
            email: userr.email,
            phoneNum: userr.phoneNum,
            password: hashedPassword,
            role: 'operator',
            status: 'active',
        });
        try{
            //let data = await db.collection("users").insertOne(mongoObject)
            //response.json(data)
            //res.send(user)
            await operator.save();
            res.status(201).json({success:true, data:user})
        }
        catch(error)
        {
            //console.error("Error in creating :", error.message)
            return res.status(500).json({success:'Failure',message:'Server error'})
        }
    }
}//end createAnOperator




export const loginForUsers = async (req,res) =>{
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Compare the password from the request with the user's stored password
        const isPasswordMatch = await bcrypt.compare(password, user.password);


        if (!isPasswordMatch) {
            return res.json({ success: false, message: "Incorrect Password" });
        }

        // Generate a JWT token with the user as the payload
        const token = jwt.sign({ userEmail:user.email,userName:user.name,userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.json({ role: user.role, token });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }

}


export const updateAnOperator = async (req, res) => {
    const { id } = req.params;
    const { name, phoneNum, password } = req.body;

    //console.log('Updating Operator with ID:', id);
    //console.log('Request Body:', req.body);

    // 🔹 Validate the User ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("❌ Invalid User ID");
        return res.status(400).json({ success: false, message: "Invalid User ID" });
    }

    try {
        // 🔹 Check if the user exists
        const existingUser = await User.findById(id);
        if (!existingUser) {
            console.log("❌ User not found");
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (existingUser.role !== "operator") {
            console.log("❌ User is not an operator");
            return res.status(403).json({ success: false, message: "User is not an operator" });
        }

        // 🔹 Prepare update object
        const updateData = {};
        if (name) updateData.name = name;
        if (phoneNum) updateData.phoneNum = phoneNum;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
            console.log("✅ Password successfully hashed.");
        }

        // 🔹 Ensure there is something to update
        if (Object.keys(updateData).length === 0) {
            console.log("❌ No valid fields provided for update.");
            return res.status(400).json({ success: false, message: "No valid fields provided for update" });
        }

        console.log("🔹 Updating operator in database:", updateData);
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        console.log("✅ Update successful:", updatedUser);
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        console.error("❌ Error updating operator:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// GET all operators except admins

export const getAllOperator = async (req, res) => {
    try {
        const operators = await User.find({ role: { $ne: "admin" } }) // Exclude "admin"
            .select("_id name email phoneNum status"); // Select only required fields

        res.status(200).json({ success: true, data: operators });
    } catch (error) {
        console.error("Error fetching operators:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



export const changePassword = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    // Validate input fields
    if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    try {
        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Compare old password with hashed password in DB
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect old password" });
        }

        // Hash new password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password in DB
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Password changed successfully" });

    } catch (error) {
        console.error("Error changing password:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};



