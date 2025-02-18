import express from "express";

import {updateOperator,getAllOperator,createOperator,loginForUsers,createAnOperator,updateAnOperator,changePassword} from "../controllers/userController.js"
import jwt from 'jsonwebtoken';

const router = express.Router();
const keys='jkjuiuy878'

//router.use(verifyToken);

router.put('/update/:id',updateAnOperator);
router.get("/getalloperator",getAllOperator);
router.post("/create-operator",createAnOperator);
router.post("/login-users",loginForUsers);
router.post("/change-password", changePassword);
console.log(`gggg--->${process.env.CLOUDINARY_CLOUD_NAME}`)
function verifyToken(request, response, next) {
    const authHeaders = request.headers["authorization"]
    const token = authHeaders && authHeaders.split(' ')[1]
    if (!token) {
        return response.status(401).json({message: "Authentication token is missing"})
    }

    jwt.verify(token, keys, (error, user) => {
        //jwt.verify(token, process.env.SECRETKEY, (error, user) => {
        if (error) {
            return response.status(403).json({message: "Invalid Token"})
        }

        request.body.user = user
        next()
    })
}




export default router;