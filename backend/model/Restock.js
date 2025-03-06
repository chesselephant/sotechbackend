import mongoose from 'mongoose';

const restockSchema = mongoose.Schema(
    {
        restocker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }, // References the User model

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        }, // References the Product model

        oldQuantity: {
            type: Number,
            required: true
        }, // The quantity before restocking

        newQuantity: {
            type: Number,
            required: true
        }, // The quantity after restocking

        restockDate: {
            type: Date,
            default: Date.now
        } // Automatically sets the date when restocking occurs
    },
    { timestamps: true }
);

const Restock = mongoose.model('Restock', restockSchema);
export default Restock;
