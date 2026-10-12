const express = require('express')
const askAI = require('../controller/aiController')

const router = express.Router()

router.post("/ask",askAI)

module.exports = router