import mongoose from 'mongoose';

const IssueSchema = new mongoose.Schema({
    issueId: {
        type: String,
        required: true,
        unique: true
    },
    operatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the user issuing the product
        required: true
    },
    dateIssued: {
        type: Date,
        default: Date.now
    },
    operatorComment: {
        type: String,
        default: "No Comment" // Default value if no comment is provided
    },
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        location: { type: String, required: true }
    },
    issuedProducts: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            productName: { type: String, required: true },
            unitPrice: { type: Number, required: true }, // ✅ Store unit price at the time of issuance
            quantity: { type: Number, required: true }
        }
    ],
    discount: {
        type: Number,
        default: 0 // ✅ Discount amount (in currency)
    },
    discountPercent: {
        type: Number,
        default: 0 // ✅ Discount percentage (e.g., 10 for 10%)
    }
});

const IssueProduct = mongoose.model('IssueProduct', IssueSchema);
export default IssueProduct;
