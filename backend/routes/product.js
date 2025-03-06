import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import jwt from 'jsonwebtoken';
import {
    createProduct,
    getAllProducts,
    getProductByName,
    EditProductDetails,
    getProductById,
    IssueProductt,
    issueProduct3,
    increaseProductQuantity, getAllIssues,getIssueById,updateDiscount,getDailySales
} from "../controllers/productController.js";

const router = express.Router();
const keys='jkjuiuy878'
//router.use(verifyToken);
const upload = multer({ storage });

// Route to create a product (with image upload)
router.post("/create", upload.single("imageUrl"), createProduct);

// Route to get all products (paginated)
router.get("/", getAllProducts);

// Route to get product by name
router.get("/gpbn/:name", getProductByName);

router.get("/:id",getProductById);

router.get("/all/all-issue", getAllIssues);///api/products/getAll-issues

//const upload = multer({ dest: "uploads/" }); // Multer for file handling

// Update Product (Only provided fields will be updated)
router.put("/:id", upload.single("imageUrl"), EditProductDetails);



router.post("/issues/issueproducts",issueProduct3)

router.put("/increase-quantity/:id", increaseProductQuantity);

router.get("/issue/:id", getIssueById);

router.put("/update-discount/:id", updateDiscount);

router.get("/salez/daily", getDailySales);//http://localhost:5000/api/products/salez/daily
export default router;


