const express=require('express');
var router=express.Router();
const conn=require('../config/db-config');

router.get('/', async (req, res) => {
    const dbConn=conn.init();
    conn.connect(dbConn);
    
    // const query='INSERT INTO test (testcol) VALUES (?)';
    // const data='riss';
    // const id=await conn.insertRetId(dbConn, query, data);

    conn.disconnect(dbConn);

    res.json({
        id: id,
    });
})

module.exports=router;