const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, (req,res)=>{

res.json("Protected profile route accessed");

});

module.exports = router;