const Product = require('../models/product');
const swapRequest = require('../models/swapRequest');

exports.getAllProducts = async (req, res) => {
    try {
      const products = await Product.find();
      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error'
      });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            count: product.length,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

exports.getUserProducts = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const products = await Product.find({userId: userId});
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { title, price, description, imageUrl } = req.body;
        const userId = req.session.user._id;
    
        const newProduct = new Product({
            title,
            price,
            description,
            imageUrl,
            userId
        });
    
        const product = await newProduct.save();
    
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

exports.editProduct = async (req, res) => {
    try {
        const { title, price, description, imageUrl } = req.body;
        const productId = req.params.id;
        const userId = req.session.user._id;
    
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        if (product.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to edit this product' });
        }

        product.title = title || product.title;
        product.price = price || product.price;
        product.description = description || product.description;
        product.imageUrl = imageUrl || product.imageUrl;

        const updatedProduct = await product.save();
    
        res.status(200).json({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

exports.addToGiveawayProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user._id;
    
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        if (product.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to giveaway this product' });
        }

        product.isGiveAway = true;

        const updatedProduct = await product.save();
    
        res.status(200).json({
            success: true,
            message: 'Product added to giveaway successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

exports.addToSelledProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user._id;
    
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        if (product.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to sell this product' });
        }

        product.isSelled = true;

        const updatedProduct = await product.save();
    
        res.status(200).json({
            success: true,
            message: 'Product added to selled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

exports.requestToSwapProduct = async (req, res) => {
    const { fromProductId, toProductId } = req.body;
    const userId = req.session.user._id;

    try {
        const fromProduct = await Product.findById(fromProductId);
        const toProduct = await Product.findById(toProductId);

        if (!fromProduct || !toProduct) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        console.log(fromProduct.userId, userId);
        if (fromProduct.userId.toString() !== userId.toString()) {
            return res.status(401).json({ success: false, error: 'Not authorized to request a swap for this product' });
        }

        const swapRequestData = new swapRequest({
            fromProductId,
            toProductId
        });

        await swapRequestData.save();

        fromProduct.swapStatus = 'requested';
        fromProduct.swapWithProductId = toProductId;
        await fromProduct.save();

        toProduct.swapStatus = 'pending';
        toProduct.swapWithProductId = fromProductId;
        await toProduct.save();

        res.status(201).json({ success: true, data: swapRequestData });
    }catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

exports.respondToSwapProduct = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const userId = req.session.user._id;
    
    try {
        const swapRequestData = await swapRequest.findById(id);
        
        if (!swapRequestData) {
            return res.status(404).json({ success: false, error: 'Swap request not found.!' });
        }
        
        const toProduct = await Product.findById(swapRequestData.toProductId);
        
        if (toProduct.userId.toString() !== userId.toString()) {
            return res.status(401).json({ success: false, error: 'Not authorized to respond to this swap request' });
        }

        swapRequestData.status = status;
        await swapRequestData.save();

        const fromProduct = await Product.findById(swapRequestData.fromProductId);

        if (status === 'approved') {
            fromProduct.swapStatus = 'approved';
            toProduct.swapStatus = 'approved';
        } else {
            fromProduct.swapStatus = 'rejected';
            toProduct.swapStatus = 'rejected';
        }

        await fromProduct.save();
        await toProduct.save();

        res.status(200).json({ success: true, data: swapRequestData });
    }catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

exports.requestToGiveawayProduct = async (req, res) => {
    const { productId } = req.params;
    const userId = req.session.user._id;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        if (!product.isGiveAway) {
            return res.status(400).json({ success: false, error: 'Product is not marked for giveaway' });
        }

        const existingRequest = product.giveawayRequests.find(request => request.userId.toString() === userId);
        if (existingRequest) {
            return res.status(400).json({ success: false, error: 'You have already requested this product' });
        }

        product.giveawayRequests.push({ userId: userId, status: 'requested'});
        await product.save();

        res.status(200).json({ success: true, message: 'Request for giveaway added successfully' });
    }catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

exports.selectGiveawayWinner = async (req, res) => {
    const { productId } = req.params;
    const userId = req.session.user._id;

    try {
        const product = await Product.findById(productId).populate('giveawayRequests.userId');

        if (product.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to giveaway this product' });
        }

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        if (!product.isGiveAway) {
            return res.status(400).json({ success: false, error: 'Product is not marked for giveaway' });
        }

        if (product.giveawayRequests.length === 0) {
            return res.status(400).json({ success: false, error: 'No giveaway requests found' });
        }


        // Select a random winner
        const randomIndex = Math.floor(Math.random() * product.giveawayRequests.length);
        const winner = product.giveawayRequests[randomIndex];

        // Update product with the winner's information
        product.giveawayWinner = {
            userId: winner.userId._id,
            selectedAt: Date.now()
        };

        await product.save();

        res.status(200).json({
            success: true,
            message: `Winner selected successfully`,
            winner: winner.userId._id
        });
    }catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user._id;
    
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        if (product.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this product' });
        }

        await Product.findByIdAndDelete(productId);
    
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};