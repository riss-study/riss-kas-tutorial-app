const express=require('express');
const User=require('../model/user');
const wallet=require('../service/kas/wallet');
var router=express.Router();
const conn=require('../config/db-config');
const conv=require('../utils/conv')
const node=require('../service/kas/node')
const th=require('../service/kas/th')
const caver=require('caver-js')
const time=require('../utils/time')

//회원가입 -> 아이디 비번 입력해서 오면, 지갑 계정 만들어줌
router.post('/', async (req, res) => {
    //create an account API(kas api와 연동해서 klaytn 계정 생성)
    const account=await wallet.createAccount();
    console.log(account);

    // save address, userid, password of klaytn account created
    const user = new User({
        name: req.body.username,
        password: req.body.password,
        address: account.address,
        publicKey: account.publicKey,
    });

    const dbConn=conn.init();
    conn.connect(dbConn);
    user.save(dbConn);
    conn.disconnect(dbConn);

    //address return
    res.json({
        address: user.address,
    });
});

//계정의 klay 잔액(balance) 조회
router.get('/:user/klay', async (req, res) => {
    const dbConn=conn.init();
    conn.connect(dbConn);
 
    const address=await conv.userToAddress(dbConn, req.params.user);
    const balance=await node.getBalance(address);

    conn.disconnect(dbConn);
    res.json({
        balance,
    });
});

//klay 전송 트랜잭션 api
// POST /v1/user/:user/klay API
router.post('/:user/klay', async (req, res) => {
    const dbConn=conn.init();
    conn.connect(dbConn);
    console.log(req.body.to, req.body.amount)
    const from=await conv.userToAddress(dbConn, req.params.user);
    const to=await conv.userToAddress(dbConn, req.body.to);

    conn.disconnect(dbConn);
    
    const amount=req.body.amount;
    console.log(from, to, amount);

    const txHash=await wallet.sendTransfer(from, to, amount);

    // for (let i=0; 3>i; ++i) {
    //     await time.sleep(1000);
    //     console.log('recept', i, '초 지남');
    //     const res=await node.getReceipt(txHash);
    //     if (res) {
    //         console.log('this is res');
    //         console.log(res);
    //         break;
    //     }
    // }

    res.json({
        txHash,
    });
});

//EOA(사람)의 klay 송수신 트랜잭션 내역 조회 api
//timestamp를 이용해서 나중에 클라이언트가 로컬 db로 내역과 timestamp를 저장해서 보고 이를 저장 복원하는 기능도 개발해야함
//TODO: GET /v1/user/:user/klay/transfer-history?start-timestamp=:ts&end-timestamp=:ts API
router.get('/:user/klay/transfer-history', async (req, res) => {
    const dbConn=conn.init();
    conn.connect(dbConn);

    const address=await conv.userToAddress(dbConn, req.params.user);
    const tStart=req.query['start-timestamp'];
    const tEnd=req.query['end-timestamp'];

    const history=await th.klayHistory(address, tStart, tEnd);

    const ret=[];
    for (const el of history) {
        const klay=caver.utils.fromPeb(caver.utils.hexToNumberString(el.value), 'KLAY',);
        const item={
            value: klay,
            timestamp: el.timestamp,
        };
        let target='';

        if (address === caver.utils.toChecksumAddress(el.from)) {
            item.eventType='sent';
            target=el.to;
        }
        else {
            item.eventType='recevied';
            target=el.from;
        }

        const targetUser=await conv.addressToUser(dbConn, target);

        item.target=targetUser != ''? targetUser : target;
        ret.push(item);
    }

    conn.disconnect(dbConn);

    res.json(ret);
});


module.exports=router;