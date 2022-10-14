const express=require('express');
const User=require('../model/user');
var router=express.Router();
const conn=require('../config/db-config')

//어플에서 사용자 prefix 검색하는 용도의 api (공동 계정 금고도 검색 추가했음)
//TODO: GET /v1/search?user-pattern=:user-prefix API
router.get('', async (req, res) => {
    console.log('/v1/search GET 요청 들어옴')
    console.log(req.query);
    var pattern=req.query['user-pattern'];

    const dbConn=conn.init();
    conn.connect(dbConn);
    const doc=await User.find(dbConn, pattern);
    const docMultiSig=await Safe.find(dbConn, pattern);

    conn.disconnect(dbConn);
    
    const users=[];
    doc.forEach((element) => {
       users.push(element.name); 
    });

    docMultiSig.forEach((element) => {
        users.push(element.name);
    });

    res.json({
        users,
    });
});

module.exports=router;