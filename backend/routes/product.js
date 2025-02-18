import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import jwt from 'jsonwebtoken';
import { createProduct,getAllProducts,getProductByName,EditProductDetails } from "../controllers/productController.js";

const router = express.Router();
const keys='jkjuiuy878'
//router.use(verifyToken);
const upload = multer({ storage });

// Route to create a product (with image upload)
router.post("/create", upload.single("imageUrl"), createProduct);

// Route to get all products (paginated)
router.get("/", getAllProducts);

// Route to get product by name
router.get("/:name", getProductByName);

//const upload = multer({ dest: "uploads/" }); // Multer for file handling

// Update Product (Only provided fields will be updated)
router.put("/:id", upload.single("imageUrl"), EditProductDetails);


function verifyToken(request, response, next) {
    const authHeaders = request.headers["authorization"]
    const token = authHeaders && authHeaders.split(' ')[1]
    if (!token) {
        return response.status(401).json({message: "Authentication token is missing"})
    }

    jwt.verify(token,'jhjjh67676' , (error, user) => {
        if (error) {
            return response.status(403).json({message: "Invalid Token"})
        }

        request.body.user = user
        next()
    })
}



export default router;


