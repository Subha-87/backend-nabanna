const express = require('express')
const verifyToken = require("../middleware/auth");

const{postSMScomplain,postWhatsAppMsg} = require('../controller/messageController') 

const router = express.Router()


router.post('/send-sms',verifyToken,postSMScomplain)
router.post('/send-whatsapp',verifyToken,postWhatsAppMsg)

module.exports = router
