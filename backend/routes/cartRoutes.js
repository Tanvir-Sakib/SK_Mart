const express = require("express");
const router = express.Router();
const { addToCart, 
        getCart, 
        removeItem,  
        incrementQuantity,
        decrementQuantity,
        clearCart,
    } = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

// Only logged-in users can access
router.post("/", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.delete("/:productId", authMiddleware, removeItem);
router.put("/:productId/increment", authMiddleware, incrementQuantity);
router.put("/:productId/decrement", authMiddleware, decrementQuantity);
router.delete("/", authMiddleware, clearCart);

module.exports = router;