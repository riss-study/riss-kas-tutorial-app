const express=require('express');
const multer=require('multer');
const conv=require('../utils/conv');
const Metadata=require('../model/metadata');
const kip17=require('../service/kas/kip17');
var router=express.Router();
const conn=require('../config/db-config')
const endpoint='http://222.111.130.66:9998';

//메타데이터와 이미지를 업로드 받는 storage(파일 저장 기능)
var storage=multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');    //이미지 파일을 해당 경로에 저장
    },
    filename: (req, file, cb) => {
        var filetype=file.originalname.substring(file.originalname.length-3,);
        cb(null, 'image-'+Date.now()+'.'+filetype);
    },
});
var upload=multer({
    storage: storage,
});

//발행 후, 민팅 api
//TODO: POST /v1/asset/:user/issue API
//upload.sing('file'): file로 이미지 파일이 들어오는 데, 이를 storage에 업로드함
router.post('/:user/issue', upload.single('file'), async function (
    req, res, next,
) {
    //파일 업로드 완료 후, 실제 아래 핸들러들을 수행
    console.log(req.body);
    console.log(req.params);
    
    if (!req.file) {
        res.status(500);
        return next(err);
    }

    //이미지 uri 추출
    const img=endpoint+'/images/'+req.file.filename;

    const dbConn=conn.init();
    conn.connect(dbConn);

    //메타데이터 만들고, 실제 db에 저장
    const metadata=new Metadata({
        name: req.body.name,
        description: req.body.description,
        kind: req.body.kind,
        image: img,
    });
    const doc=await metadata.save(dbConn);
    const id='0x'+doc.insertId.toString();   //mysql db에 메타데이터 insert 후, 해당 id return
    const uri=`${endpoint}/v1/metadata/${id}`;
    const address=await conv.userToAddress(dbConn, req.params.user);

    //kas api를 이용하여 token 발행
    await kip17.issueToken(address, id, uri);

    res.json({
        metadata: doc.insertId.toString(),
    });
});

//TODO: GET /v1/asset/:user/token API
//특정 EOA가 소유한 token 조회 api
router.get('/:user/token', async (req, res) => {
    const user=req.params.user;

    const dbConn=conn.init();
    conn.connect(dbConn);

    const address=await conv.userToAddress(dbConn, user);

    const tokens=await kip17.listTokens(address);

    conn.disconnect(dbConn);

    res.json(tokens);
});

//TODO: POST /v1/asset/:user/token/:token API
//NFT 전송 API
router.post('/:user/token/:token', async (req, res) => {
    console.log('NFT 전송 api 호출');
    console.log(req.body);
    const user=req.params.user;
    const tokenId=req.params.token;
    const toUser=req.body.to;
    console.log(user, tokenId, toUser);

    const dbConn=conn.init();
    conn.connect(dbConn);

    const address=await conv.userToAddress(dbConn, user);
    const to=await conv.userToAddress(dbConn, toUser);

    conn.disconnect(dbConn);

    console.log('토큰 보낼 최종 내역');
    console.log(address, tokenId, to);
    const result=await kip17.sendToken(address, tokenId, to);
    res.json(result);
});

module.exports=router;