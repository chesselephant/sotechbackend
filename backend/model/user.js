
import mongoose from 'mongoose';



const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phoneNum: { type: String, required: true, unique: true },
    password: { type: String},
    role: { type: String, enum: ["admin", "operator"], required: true },
    status: { type: String, enum: ["active", "deactivated"], default: "active" },
  },
  { timestamps: true }
);



const User = mongoose.model('User', userSchema);
export default User;

/*
import mongoose from 'mongoose';




const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phoneNum: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "operator"], required: true },
        status: { type: String, enum: ["active", "deactivated"], default: "active" },
    },
    { timestamps: true }
);



const User = mongoose.model('User', userSchema);
export default User;
*/