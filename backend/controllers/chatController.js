const Chat = require('../models/Chat');
const Product = require('../models/product');

exports.initiateChat = async (req, res) => {
    const { productId } = req.body;
    const buyerId = req.session.user._id;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const sellerId = product.userId;

        if (buyerId.toString() === sellerId.toString()) {
            return res.status(400).json({ success: false, error: 'You cannot initiate chat with yourself' });
        }

        const existingChat = await Chat.findOne({ productId, buyerId, sellerId });

        if (existingChat) {
            return res.status(200).json({ success: true, chatId: existingChat._id });
        }

        const chat = new Chat({
            productId,
            buyerId,
            sellerId,
            messages: []
        });

        await chat.save();

        res.status(201).json({ success: true, chatId: chat._id });
    }catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

exports.sendMessage = async (req, res) => {
    const { chatId } = req.params;
    const { content } = req.body;
    const sender = req.session.user._id;

    try {
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ success: false, error: 'Chat not found' });
        }

        console.log(sender.toString(), chat.buyerId.toString(), chat.sellerId.toString());

        chat.messages.push({
            sender,
            content,
            timestamp: new Date()
        });

        await chat.save();

        res.status(201).json({ success: true, chat });
    }catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}