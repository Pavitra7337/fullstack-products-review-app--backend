const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Middleware for JSON parsing
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://5e4:pavitra@cluster0.r7lebwm.mongodb.net/product_review', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
	console.log('Connected to MongoDB')
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const User = mongoose.model("User", userSchema)

app.get("/", cors(), (req, res) => {
    // Your GET route logic here
})

app.post("/", async (req, res) => {
    const { email, password } = req.body

    try {
        const check = await User.findOne({ email: email })

        if (check) {
            res.json("exist")
        } else {
            res.json("notexist")
        }

    } catch (e) {
        res.json("fail")
    }
})

app.post("/signup", async (req, res) => {
    const { email, password } = req.body

    const newUser = new User({
        email: email,
        password: password
    })

    try {
        const check = await User.findOne({ email: email })

        if (check) {
            res.json("exist")
        } else {
            res.json("notexist")
            await newUser.save()
        }

    } catch (e) {
        res.json("fail")
    }
})
// Define the Product schema
const productSchema = new mongoose.Schema({
	name: String,
	description: String,
	image: String,
	reviews: [
		{
			user: String,
			rating: Number,

			comment: String,
		},
	],
});

const Product = mongoose.model('Product', productSchema);

// API endpoints
// Route to add a new product
app.post('/api/products', async (req, res) => {
	try {
		const { name, description, image } = req.body;


		// Validate request data
		if (!name || !description || !image) {
			return res.status(400).json(
				{
					message: 'Incomplete product data'
				}
			);
		}

		// Create a new product
		const newProduct = new Product({
			name,
			description,
			image,
			reviews: [],
		});

		// Save the new product to the database
		const savedProduct = await newProduct.save();

		// Respond with the newly added product
		res.status(201).json(savedProduct);
	} catch (error) {
		console.error('Error adding product:', error);
		res.status(500)
			.json(
				{
					message: 'Internal Server Error'
				}
			);
	}
});
app.get('/api/products', async (req, res) => {
	try {
		const products = await Product.find();
		res.json(products);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

app.post('/api/products/:id/review', async (req, res) => {
	const { user, rating, comment } = req.body;

	try {
		const product =
			await Product.findById(req.params.id);
		product.reviews
			.push(
				{
					user, rating,
					comment
				}
			);
		await product.save();
		res.status(201).json(product);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Delete a product by ID
app.delete('/api/products/:id', async (req, res) => {
	const productId = req.params.id;
	try {
		// Find the product by ID and delete it from the database
		const deletedProduct =
			await Product.findByIdAndDelete(productId);

		if (!deletedProduct) {
			return res.status(404)
				.json(
					{
						message: 'Product not found'
					}
				);
		}

		res.json(
			{
				message: 'Product deleted',
				deletedProduct
			}
		);
	} catch (error) {
		console.error('Error deleting product:', error);
		res.status(500)
			.json(
				{
					message: 'Internal Server Error'
				}
			);
	}
});

app.listen(PORT,
	() => {
		console.log(`Server is running on port ${PORT}`);
	});
