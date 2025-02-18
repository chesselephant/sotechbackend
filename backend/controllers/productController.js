import Product from "../model/product.js";
import { cloudinary } from "../config/cloudinary.js";


const PLACEHOLDER_IMAGE = "https://res.cloudinary.com/demo/image/upload/v1622332921/placeholder.jpg";

export const createProduct = async (req, res) => {
    try {
        console.log("Received Request:", req.body);
        console.log("Received File:", req.file);

        // Validate required fields
        if (!req.body.name || !req.body.description || !req.body.price || !req.body.quantity) {
            return res.status(400).json({ success: false, message: "All fields (name, description, price, quantity) are required" });
        }

        let imageUrl = PLACEHOLDER_IMAGE; // Default to placeholder image

        // If an image is uploaded, attempt to upload it to Cloudinary
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path);
                console.log("Cloudinary Upload Result:", result);
                imageUrl = result.secure_url; // Use the uploaded image
            } catch (error) {
                console.error("🔥 Cloudinary Upload Error:", error);
                // If Cloudinary upload fails, keep the placeholder image
            }
        }

        // Save product to MongoDB
        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            imageUrl: imageUrl, // Uses uploaded or placeholder image
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: "Product created successfully", data: newProduct });

    } catch (error) {
        console.error("🔥 Error creating product:", error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products
        res.status(200).json(products); // Return only products
    } catch (error) {
        console.error("🔥 Error fetching products:", error);
        res.status(500).json([]); // Return empty array in case of an error
    }
};
// Function to fetch a product by name
export const getProductByName = async (req, res) => {
    try {
        const { name } = req.params;

        const product = await Product.findOne({ name: { $regex: new RegExp("^" + name + "$", "i") } });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("🔥 Error fetching product by name:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};




export const EditProductDetails = async (req, res) => {
    try {
        console.log("🔄 Received Update Request:", req.body);
        console.log("📷 Received File:", req.file); // Debugging file upload

        const { id } = req.params;

        // Find the existing product
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "❌ Product not found"
            });
        }

        let updateData = { ...req.body }; // Clone request body for updates

        // ✅ Upload image to Cloudinary if a new file is uploaded
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path);
                console.log("✅ Cloudinary Upload Success:", result);
                updateData.imageUrl = result.secure_url; // Update image URL
            } catch (error) {
                console.error("🔥 Cloudinary Upload Error:", error);
                return res.status(500).json({
                    success: false,
                    message: "❌ Image upload failed. Try again!"
                });
            }
        }

        // ✅ Only update provided fields
        const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updateData }, { new: true });

        res.status(200).json({
            success: true,
            message: "✅ Product updated successfully!",
            data: updatedProduct
        });

    } catch (error) {
        console.error("🔥 Error updating product:", error);
        res.status(500).json({
            success: false,
            message: "❌ Internal Server Error. Please try again!"
        });
    }
};


