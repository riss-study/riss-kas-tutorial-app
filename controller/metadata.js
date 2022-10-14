const express=require('express');
const Metadata=require('../model/metadata');
var router=express.Router();
const conn=require('../config/db-config');

//TODO: GET /v1/metadata/:id API
//token 목록 조회하고, 특정 토큰을 선택할 때 해당 토큰에 대한 상세 메타데이터 조회하는 API
router.get('/:id', async (req, res) => {
    console.log(req.params.id);
    const id=req.params.id.replace(/^0x/, '');
    console.log(id);

    const dbConn=conn.init();
    conn.connect(dbConn);

    const doc=await Metadata.findById(dbConn, id);  //mysql에 맞게 메소드 수정해야 함
    console.log(doc);

    conn.disconnect(dbConn);

    res.json({
        tokenId: req.params.id,
        name: doc.name,
        kind: doc.kind,
        image: doc.image,
        description: doc.description,
    });
});

module.exports=router;