const express = require('express')
const multer = require("multer");
const upload = multer(); // no disk storage → handles FormData fields
const verifyToken = require("../middleware/auth");

//FormData is multipart/form-data, and Express cannot parse it using express.json() or express.urlencoded().
//To handle FormData, you need a middleware like multer or express-fileupload.
/*Because multipart/form-data requires a special parser.
express.json() can only parse:

✔ JSON
✔ x-www-form-urlencoded*/

const router = express.Router()

const{postItComplainData,getAllComplain,getITComplain,getITResolvedData,updateComplain,getSolvedItComplainbyDate,getSearchAllResult,deleteITComplain,getSearchDomainResult} = require('../controller/complainController')

//router.post('/postData',upload.none(),postItComplainData) if data is coming as formdata/multipart
router.post('/postData',verifyToken,postItComplainData) // data is coming as json
//Why upload.none()? frontend sending text fields only (no file).

router.get('/getAll',verifyToken,getAllComplain)
router.get('/getComplainIT/:domain',verifyToken,getITComplain)
router.get('/getSolvedITComplain/:it_domain',verifyToken,getITResolvedData)
//router.get('/getNetAll/:domain',getAllNetWorkComplain)
//router.get('/getVoiceAll',getAllVoiceComplain )
router.put('/edit/:edit_id',verifyToken,updateComplain)
//router.get('/solved-net',allNetworkResolvedData)
//router.get('/solved-voice',allVoiceResolvedData )
router.get('/filter-date/:it_wing',verifyToken,getSolvedItComplainbyDate)

//router.get('/filter-date',getResolvedNetDatabyDate )
//router.get('/filter-date-voice',getResolvedVoiceDatabyDate )
//router.get('/filter-date-hardware',getResolvedHardwareDatabyDate)

router.get('/search-all-complain/:s_key',verifyToken,getSearchAllResult)
//router.get('/pc/getAll',getAllPcComplain)
//router.get('/solved-pc',allResolvedPCproblems)

router.delete('/delete/:delId',verifyToken,deleteITComplain)

router.get("/find-complain/:it_wing",verifyToken,getSearchDomainResult)




module.exports = router