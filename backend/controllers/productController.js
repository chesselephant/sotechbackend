import Product from "../model/product.js";
import Restock from "../model/Restock.js";
import IssueProduct from "../model/issueProduct.js"
import { cloudinary } from "../config/cloudinary.js";
import { uuid } from 'uuidv4'
import User from "../model/user.js";

const PLACEHOLDER_IMAGE = "https://res.cloudinary.com/dv3r7p7jp/image/upload/v1740044195/place-holder_ckygim.jpg";

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
        console.log(`value of ${name}`)

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

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("🔥 Error fetching product by ID:", error);
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


//////////////////////////////Issue Products/////////////////////////////////////////

export const IssueProductt = async (req, res) => {
    try {
        const { customer, issuedProducts } = req.body;
        const operatorId = req.user.id; // Get from JWT auth
        const issueId = uuid(); // Generate a single issueId for all products

        if (!customer || !customer.name || !customer.phone || !customer.location) {
            return res.status(400).json({ message: "Customer details are required" });
        }
        if (!issuedProducts || issuedProducts.length === 0) {
            return res.status(400).json({ message: "At least one product must be issued" });
        }

        // ✅ Validate product stock and fetch unit price
        for (const item of issuedProducts) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${product.name}` });
            }

            // ✅ Attach unit price from the product at the time of issuance
            item.unitPrice = product.price;
        }

        // ✅ Deduct issued quantities from stock
        for (const item of issuedProducts) {
            const product = await Product.findById(item.productId);
            product.quantity -= item.quantity;
            await product.save();
        }

        // ✅ Save issue transaction
        const issue = new IssueProduct({
            issueId,
            operatorId,
            dateIssued: new Date(),
            customer,
            issuedProducts
        });

        await issue.save();

        res.status(200).json({ message: "Products issued successfully", issue });
    } catch (error) {
        console.error("Issue product error:", error);
        res.status(500).json({ message: "Internal server error" });
    }

};


///////////////////////////////////////////////////////////////////////////////////////////////


export const issueProduct2 = async (req, res) => {
    try {
        const { clientName, clientPhone, clientLocation, operatorComment, issuedProducts } = req.body;
        const operator = req.user.id; // Get operator ID from JWT authentication
        const issueId = uuidv4(); // Generate a unique issue ID

        // ✅ Validate customer details
        if (!clientName || !clientPhone || !clientLocation) {
            return res.status(400).json({ message: "Client details are required" });
        }

        // ✅ Validate products
        if (!issuedProducts || issuedProducts.length === 0) {
            return res.status(400).json({ message: "At least one product must be issued" });
        }

        const productsIssued = [];

        // ✅ Check stock and fetch unit prices
        for (const item of issuedProducts) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${product.name}` });
            }

            // ✅ Deduct stock
            product.quantity -= item.quantity;
            await product.save();

            // ✅ Store product details in transaction
            productsIssued.push({
                product: product._id,
                productName: product.name,
                quantitySupplied: item.quantity,
                unitPrice: product.price
            });
        }

        // ✅ Save transaction record
        const transaction = new Transaction({
            operator,
            operatorComment: operatorComment || 'No Comment',
            clientName,
            clientPhone,
            clientLocation,
            issueId,
            productsIssued,
        });

        await transaction.save();

        res.status(201).json({ message: "Products issued successfully", transaction });

    } catch (error) {
        console.error("Issue product error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const issueProduct4 = async (req, res) => {
    console.log("🛠️ issueProduct3 API was called!");
    const { issueId,operatorId,dateIssued,customer,issuedProducts  } = req.body;
    try {
        console.log(req.body);


    } catch (error) {
    }
};

export const issueProduct3 = async (req, res) => {
    console.log("🛠️ issueProduct3 API was called!");
    try {
        console.log("🔍 Received Data:", req.body);
        //const { clientName, clientPhone, clientLocation, operatorComment, issuedProducts } = req.body;
        const { issueId,operatorId,dateIssued,customer,issuedProducts,operatorComment  } = req.body;
        //const operator = operatorId; // Get operator ID from JWT authentication
        //const issueId = uuidv4(); // Generate a unique issue ID

        // ✅ Validate client details
        if (!customer.name || !customer.phone || !customer.location) {
            return res.status(400).json({ message: "Client details are required" });
        }

        // ✅ Validate products
        if (!issuedProducts || issuedProducts.length === 0) {
            return res.status(400).json({ message: "At least one product must be issued" });
        }

        const productsIssued = [];

        // ✅ Check stock and process transactions
        for (const item of issuedProducts) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${product.name}` });
            }

            // ✅ Deduct stock
            product.quantity -= item.quantity;
            await product.save();

            // ✅ Store transaction with the adjusted price from the frontend
            productsIssued.push({
                product: product._id,
                productName: product.name,
                quantitySupplied: item.quantity, // Now matches frontend key
                unitPrice: item.unitPrice // Use the adjusted price from the frontend
            });
        }

        // ✅ Save transaction record
        const transaction = new IssueProduct({

            issueId:issueId,
            operatorId:operatorId,
            operatorComment: operatorComment || "No Comment",
            customer: {
                name: customer.name,
                phone: customer.phone,
                location:customer.location
            },
            issuedProducts:issuedProducts
        });

        await transaction.save();

        res.status(201).json({ message: "Products issued successfully", transaction });

    } catch (error) {
        console.error("Issue product error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////

export const increaseProductQuantity1 = async (req, res) => {
    try {
        console.log("🔄 Received Quantity Increase Request:", req.body);

        const { id } = req.params;
        const { quantityToAdd } = req.body; // Get the quantity to increase

        // Ensure quantityToAdd is a positive number
        if (!quantityToAdd || isNaN(quantityToAdd) || quantityToAdd <= 0) {
            return res.status(400).json({
                success: false,
                message: "❌ Invalid quantity. Must be a positive number."
            });
        }

        // Find the existing product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "❌ Product not found."
            });
        }

        // Increase the quantity
        product.quantity += Number(quantityToAdd);
        const updatedProduct = await product.save(); // Save the updated product

        res.status(200).json({
            success: true,
            message: `✅ Product quantity increased by ${quantityToAdd}!`,
            data: updatedProduct
        });

    } catch (error) {
        console.error("🔥 Error updating product quantity:", error);
        res.status(500).json({
            success: false,
            message: "❌ Internal Server Error. Please try again!"
        });
    }
};

//////////////////////////////////////////////////////////////////////////////////////
export const increaseProductQuantity2 = async (req, res) => {
    try {
        console.log("🔄 Received Quantity Increase Request:", req.body);

        const { id } = req.params; // Product ID
        const { quantityToAdd } = req.body; // Quantity to increase
        console.log("🔄 product id:", id);
        // Ensure quantityToAdd is a positive number
        if (!quantityToAdd || isNaN(quantityToAdd) || quantityToAdd <= 0) {
            return res.status(400).json({
                success: false,
                message: "❌ Invalid quantity. Must be a positive number."
            });
        }

        // Find the existing product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "❌ Product not found."
            });
        }

        const oldQuantity = product.quantity; // Save old quantity before update
        product.quantity += Number(quantityToAdd); // Increase quantity
        const updatedProduct = await product.save(); // Save updated product

        // ✅ Extract user ID from token (Restocker ID)
        const token = req.headers.authorization?.split(" ")[1]; // Extract token from request headers
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "❌ Unauthorized: No token provided."
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "❌ Unauthorized: Invalid token."
            });
        }

        const restockerId = decoded.userId; // Get restocker (operator/admin) ID from the token

        // ✅ Log the restock action
        const restockEntry = new Restock({
            restocker: restockerId,
            product: product._id,
            oldQuantity,
            newQuantity: product.quantity,
        });

        await restockEntry.save(); // Save restock record
        console.log("✅ Restock logged:", restockEntry);

        res.status(200).json({
            success: true,
            message: `✅ Product quantity increased by ${quantityToAdd}!`,
            data: updatedProduct,
            restockLog: restockEntry, // Send back the restock log
        });

    } catch (error) {
        console.error("🔥 Error updating product quantity:", error);
        res.status(500).json({
            success: false,
            message: "❌ Internal Server Error. Please try again!"
        });
    }
};
///////////////////////////////////////////////////////////////////////

export const increaseProductQuantity = async (req, res) => {
    try {
        console.log("🔄 Received Quantity Increase Request:", req.body);

        const { id } = req.params; // Product ID
        const { quantityToAdd, operatorId } = req.body; // Get quantity and operator ID

        if (!quantityToAdd || isNaN(quantityToAdd) || quantityToAdd <= 0) {
            return res.status(400).json({
                success: false,
                message: "❌ Invalid quantity. Must be a positive number."
            });
        }

        if (!operatorId) {
            return res.status(400).json({
                success: false,
                message: "❌ Operator ID is required!"
            });
        }

        // Find the existing product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "❌ Product not found."
            });
        }

        const oldQuantity = product.quantity;
        product.quantity += Number(quantityToAdd);
        const updatedProduct = await product.save();

        // ✅ Log the restock action
        const restockEntry = new Restock({
            restocker: operatorId, // Use operatorId received from frontend
            product: product._id,
            oldQuantity,
            newQuantity: product.quantity,
        });

        await restockEntry.save(); // Save restock record
        console.log("✅ Restock logged:", restockEntry);

        res.status(200).json({
            success: true,
            message: `✅ Product quantity increased by ${quantityToAdd}!`,
            data: updatedProduct,
            restockLog: restockEntry,
        });

    } catch (error) {
        console.error("🔥 Error updating product quantity:", error);
        res.status(500).json({
            success: false,
            message: "❌ Internal Server Error. Please try again!"
        });
    }
};

///////////////////////////////////////////////////////////////////

//import IssueProduct from "../models/IssueProduct.js"; // Import the IssueProduct model

export const getAllIssues2 = async (req, res) => {
    console.log("📦 Fetching all issues...");
    try {
        console.log("📦 Fetching all issues...");

        // ✅ Retrieve all issues, sorted by dateIssued (latest first)
        const issues = await IssueProduct.find()
            .sort({ dateIssued: -1 }) // Sort by latest first
            .populate("operatorId", "name") // Populate operator details (if needed)
            .populate("issuedProducts.productId", "name price"); // Populate product details (optional)

        if (!issues || issues.length === 0) {
            return res.status(404).json({
                success: false,
                message: "❌ No issues found.",
            });
        }

        console.log(`✅ Found ${issues.length} issues.`);

        res.status(200).json({
            success: true,
            message: "✅ Issues retrieved successfully!",
            data: issues,
        });

    } catch (error) {
        console.error("🔥 Error fetching issues:", error);
        res.status(500).json({
            success: false,
            message: "❌ Internal Server Error. Please try again!",
        });
    }
};

export const getAllIssues3 = async (req, res) => {
    console.log("📦 Fetching all issues..fffffff.");
    return res.status(200).json({
        success: true,
        message: "Issues retrieved successfully!",
    });
}

export const getAllIssues4 = async (req, res) => {
    try {
        console.log("📦 Fetching all issues...");

        // Retrieve all issue records
        const issues = await IssueProduct.find()
            .sort({ dateIssued: -1 }) // Sort by latest first
            .populate("operatorId", "name") // Populate operator details
            .populate("issuedProducts.productId", "name price"); // Populate product details

        if (!issues || issues.length === 0) {
            return res.status(404).json({
                success: false,
                message: "❌ No issues found.",
            });
        }

        console.log(`✅ Found ${issues.length} issues.`);

        res.status(200).json({
            success: true,
            message: "✅ Issues retrieved successfully!",
            data: issues,
        });

    } catch (error) {
        console.error("🔥 Error fetching issues:", error);
        res.status(500).json({
            success: false,
            message: "❌ Internal Server Error. Please try again!",
        });
    }
};

export const getAllIssues = async (req, res) => {
    try {
        console.log("📦 Received request for /api/products/all-issue");
        console.log("Headers:", req.headers);
        console.log("Query Params:", req.query);
        console.log("Body:", req.body);

        // ✅ Fetch all issues
        const issues = await IssueProduct.find()
            .sort({ dateIssued: -1 })
            .populate("operatorId", "name") // Populate operator details
            .populate("issuedProducts.productId", "name price"); // Populate product details

        if (!issues || issues.length === 0) {
            return res.status(404).json({
                success: false,
                message: "❌ No issues found.",
            });
        }

        console.log(`✅ Found ${issues.length} issues.`);
        return res.status(200).json({
            success: true,
            message: "✅ Issues retrieved successfully!",
            data: issues,
        });

    } catch (error) {
        console.error("🔥 Error fetching issues:", error);
        return res.status(500).json({
            success: false,
            message: "❌ Internal Server Error. Please try again!",
        });
    }
};


/////////////////////////////////////////////////////////
export const getIssueById = async (req, res) => {
    try {
        console.log("📦 Received request for /api/products/issue/:id");
        console.log("Headers:", req.headers);
        console.log("Params:", req.params);

        const { id } = req.params;

        // Validate if `id` is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "❌ Invalid issue ID format.",
            });
        }

        // Fetch issue by `_id`
        const issue = await IssueProduct.findById(id)
            .populate("operatorId", "name") // Populate operator details
            .populate("issuedProducts.productId", "name price"); // Populate product details

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "❌ Issue not found.",
            });
        }

        console.log("✅ Issue found:", issue);
        return res.status(200).json({
            success: true,
            message: "✅ Issue retrieved successfully!",
            data: issue,
        });

    } catch (error) {
        console.error("🔥 Error fetching issue by ID:", error);
        return res.status(500).json({
            success: false,
            message: "❌ Internal Server Error. Please try again!",
        });
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////

export const updateDiscount = async (req, res) => {
    try {
        console.log("📦 Received request for /api/products/update-discount/:id");
        console.log("Headers:", req.headers);
        console.log("Params:", req.params);
        console.log("Body:", req.body);

        const { id } = req.params; // Get issue ID from URL
        const { discountPercent } = req.body; // Get discount percent from request body

        // ✅ Validate if `id` is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "❌ Invalid issue ID format.",
            });
        }

        // ✅ Validate discount percentage (must be between 0% and 10%)
        if (
            discountPercent === undefined ||
            isNaN(discountPercent) ||
            discountPercent < 0 ||
            discountPercent > 10
        ) {
            return res.status(400).json({
                success: false,
                message: "❌ Invalid discount percentage. Must be between 0% and 10%.",
            });
        }

        // ✅ Fetch issue by `_id`
        const issue = await IssueProduct.findById(id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "❌ Issue not found.",
            });
        }

        // ✅ Calculate total price of issued products
        const totalAmount = issue.issuedProducts.reduce(
            (total, product) => total + (product.quantity * product.unitPrice),
            0
        );

        // ✅ Calculate discount amount
        const discountAmount = (totalAmount * discountPercent) / 100;

        // ✅ Update issue with discount details
        issue.discountPercent = discountPercent;
        issue.discount = discountAmount; // Discount amount in currency

        await issue.save(); // Save the updated issue

        console.log("✅ Discount updated successfully:", issue);
        return res.status(200).json({
            success: true,
            message: "✅ Discount updated successfully!",
            data: {
                issueId: issue.issueId,
                discountPercent: issue.discountPercent,
                discountAmount: issue.discount,
                totalAmount,
                finalAmount: totalAmount - discountAmount // Amount after discount
            }
        });

    } catch (error) {
        console.error("🔥 Error updating discount:", error);
        return res.status(500).json({
            success: false,
            message: "❌ Internal Server Error. Please try again!",
        });
    }
};

///////////////////////////////////////////////////////////////////////



export const getDailySales = async (req, res) => {
    try {
        // Get today's date (start and end of day)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Set time to 12:00 AM

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // Set time to 11:59 PM

        // Fetch all issues (sales) for today
        const todaySales = await IssueProduct.find({
            dateIssued: { $gte: startOfDay, $lte: endOfDay }
        });

        // Initialize total sales value
        let totalDailySales = 0;

        // Calculate total sales per transaction
        todaySales.forEach(sale => {
            let transactionTotal = 0;

            // Calculate the total for all products in this sale
            sale.issuedProducts.forEach(product => {
                transactionTotal += product.unitPrice * product.quantity;
            });

            // Apply discount to get final transaction amount
            const finalTransactionTotal = transactionTotal - sale.discount;

            // Add this transaction's final amount to total daily sales
            totalDailySales += finalTransactionTotal;
        });

        res.status(200).json({
            success: true,
            message: "Daily sales retrieved successfully",
            totalDailySales: totalDailySales.toFixed(2) // Format to 2 decimal places
        });

    } catch (error) {
        console.error("Error calculating daily sales:", error);
        res.status(500).json({
            success: false,
            message: "Failed to calculate daily sales",
            error: error.message
        });
    }
};





