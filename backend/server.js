import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cors = require('cors');
import { connectDB } from './db.js';
import dotenv from 'dotenv';
import { createAdmin } from './CreateAdmin.js';
import AdminOperator from "./routes/user.js";
import productRoutes from "./routes/product.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
connectDB();

// Middleware
//createAdmin();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// API Routes
app.use('/api/operators', AdminOperator);
app.use('/api/products', productRoutes);

// ** Serve Vite's `dist` folder **
//app.use(express.static(path.join(__dirname, '../frontend2/dist')));
app.use(express.static(path.join(__dirname, 'public')));

// ** Serve React frontend for any unknown route (SPA support) **
app.get('*', (req, res) => {
    //res.sendFile(path.join(__dirname, '../frontend2/dist', 'index.html'));
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server started at port ${PORT}`);
});
