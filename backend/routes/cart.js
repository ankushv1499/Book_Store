const router = require("express").Router();
const User = require("../models/user");
const { authenticationToken } = require("./userAuth");


//add to cart 

router.put("/add-to-cart", authenticationToken , async (req, res) => {
 try {
    const { bookid, id } = req.headers;
     // Validate input
     if (!id || !bookid) {
        return res.status(400).json({ 
            status: "Error", 
            message: "User ID and Book ID are required" 
        });
    }
    const userData = await User.findById(id);
    const isBookinCart = userData.cart.includes(bookid);
    if(isBookinCart){
        return res.json({
            status: "Success",
            message: "Bookis already in cart",
        });

    }
    await User.findByIdAndUpdate(id, {
        $push: {cart: bookid},
    });

    return res.status(200).json({
        status: "Success",
        message: "Book added to cart",
    });
 } catch (error) {
    console.log(error);
    return res.status(500).json({message: "An error occured"})
 }
});

// remove from the cart
router.put("/remove-from-cart/:bookid", authenticationToken, async (req, res) => {
    try {
        const {bookid} = req.params;
        const{id} = req.headers;
        await User.findByIdAndUpdate(id, {
            $pull: {cart: bookid},
        });

        return res.json({
            status: "Success",
            message: "Book removed from cart",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "An error occured"})
    }
})

//get cart of perticular user
router.get("/get-user-cart", authenticationToken, async(req, res) =>{
    try {
        const {id} = req.headers;
        const userData = await User.findById(id).populate("cart");
        const cart = userData.cart;
        return res.json({
            status: "Success",
            data: cart.reverse(),
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})


module.exports = router;