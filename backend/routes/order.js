const router = require("express").Router();
const { authenticationToken } = require("./userAuth");
const Book = require("../models/book");
const Order = require("../models/order");
const { populate } = require("../models/user");
const User = require("../models/user") 

    //place order
    router.post("/place-order", authenticationToken, async (req, res) => {
        try {
            const { id } = req.headers;
            const { order } = req.body;
            for (const orderData of order) {
                const newOrder = new Order({ user: id, book: orderData._id });
                const orderDataFromDb = await newOrder.save();

                //saving order in user model 
                await User.findByIdAndUpdate(id, {
                    $push: { orders: orderDataFromDb._id },

                });
                //clearing cart
                await User.findByIdAndUpdate(id, {
                    $pull: { cart: orderData._id },
                });

                return res.json({
                    status: "Success",
                    message: "Order Placed Successfully",
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "An error occured" })
        }

    });

// get order history from perticular user
router.get("/get-order-history", authenticationToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const userData = await User.findById(id).populate({
            path: "orders",
            populate: { path: "book" },
        });

        const orderData = userData.orders.reverse();
        return res.json({
            status: "Success",
            data: orderData,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error occured" })
    }

})

//get all orders--admin
router.get("/get-all-orders", authenticationToken, async (req, res) => {
    try {
        const userData = await Order.find()
            .populate({
                path: "book",
            })
            .populate({
                path: "user",
            })
            .sort({ createdAt: -1 });

        return res.json({
            status: "Suceess",
            data: userData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error occured" })
    }
});

//update order -- admin 
router.put("/update-status/:id", authenticationToken, async (req, res) => {   
    try {
        const { id } = req.params;
        await Order.findByIdAndUpdate(id, {
            status: req.body.status,
        });
        return res.json({    
            status: "Success",
            message: "status updated successfully",

        })
   } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error occured" })

    }
})


module.exports = router;