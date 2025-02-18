import mongoose from 'mongoose';


const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true , unique: true },
    description: { type: String, required: true },
  
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 0 },
      imageUrl: { type: String, default: 'http://placeholder.com' },
  },
  { timestamps: true }
);



const Product = mongoose.model('Product', productSchema);
export default Product;
