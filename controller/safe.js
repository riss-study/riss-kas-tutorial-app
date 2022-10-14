const express=require('express');
const router=express.Router();
const wallet=require('../service/kas/wallet');
const kip17=require('../service/kas/kip17');
const node=require('../service/kas/node');
const conv=require('../utils/conv');
const time=require('../utils/time');
const Safe=require('../model/safe');
const conn=require('../config/db-config')

//TODO: create safe API
router.post('/', async (req, res) => {
    const dbConn=conn.init();
    conn.connect(dbConn);

    //금고로 사용될 계정 생성
    const account=await wallet.createAccount();

    //금고를 생성하는 사람
    const creator=await conv.userToAccount(dbConn, req.body.creator);
    console.log(creator.address)
    //금고 생성하는 사람이 금고 계정에 미리 1 KLAY (수수료) 넣어놔야 함
    const txHash=await wallet.sendTransfer(
        creator.address,
        account.address,
        1,
    );

    //receipt을 확인해서 트랜잭션이 블록체인에 정상적으로 반영됐는지 확인
    for (let i=0; 3>i; ++i) {
        await time.sleep(1000);
        const res=await node.getReceipt(txHash);
        if (res) break;
    }

    //계정 업데이트 과정
    const pubKeys=[];
    
    //1. request body에 초대자로 설정된 사람들의 퍼블릭키를 가져와서 하나로 합치는 작업
    for (const el of req.body.invitees.split(' ')) {
        const acc=await conv.userToAccount(dbConn, el);
        pubKeys.push(acc.publicKey);
    }
    console.log(pubKeys);

    await wallet.updateAccountToMultisig(
        account.address,        //multisig account로 업데이트될 계정 주소
        creator.publicKey,      //생성한 사용자(금고의 오너)에 대한 퍼블릭키
        pubKeys,                //초대한 계정에 대한 퍼블릭키
    );

    //creator가 담보 카드를 하나 가져와서 multisig account에 주게 됨, warrant: 담보카드의 tokenId
    await kip17.sendToken(creator.address, req.body.warrant, account.address);

    //공동 금고에 대한 metadata 정의
    const ret={
        name: req.body.name,
        creator: req.body.creator,
        address: account.address,
        publicKey: account.publicKey,
        tokenId: req.body.warrant,
        image: req.body.image,
        attendees: ' ' + creator.name + ' '.concat(req.body.invitees) + ',',     //[creator.name].concat(req.body.invitees),
        //attendees는 나중에 따로 관리하는 로직이나 db 스키마 생각해볼 것
        //아니면 몽고db 사용도 방법
    };

    console.log(ret);
    const safeMoney=new Safe(ret);
    await safeMoney.save(dbConn);

    conn.disconnect(dbConn);
    res.json(ret);
});

//TODO: list safes API ('v1/safe/:user')
//GET /v1/safe/:user API
router.get('/:user', async (req, res) => {
    const dbConn=conn.init();
    conn.connect(dbConn);

    const safes=await Safe.findByName(dbConn, { attendees: req.params.user });

    conn.disconnect(dbConn);

    res.json(safes);
});

//TODO: send NFT API (multisig -> ANY)
//POST /v1/safe/:safe/token/:token API
router.post('/:safe/token/:token', async (req, res) => {
    const safeAddress=req.params.safe;
    const tokenId=req.params.token;
    const toUser=req.body.to;
    const fromUser=req.body.from;
    
    const to=await conv.userToAddress(toUser);
    const from=await conv.userToAddress(fromUser);
    const result=await kip17.sendToken(safeAddress, tokenId, to);
    console.log(result);

    if (result.transactionHash) {
        res.json({ transactionHash: result.transactionHash });
        return;
    }
    await wallet.signMultisigTransaction(from, result.transactionId);

    const safe=await Safe.findOne({address: safeAddress});

    //몽고db였다면 여기 pendings에 트랜잭션 아이디를 배열이나 object(json)로 추가
    if (!safe.pendings) {
        safe.pendings={};
    }
    //이 작업 역시 mysql용으로 변경해야 함
    safe.pendings[tokenId]={
        txId: result.transactionId,
        to: toUser,
    };

    console.log(safe);
    safe.markModified('pendings');
    await safe.update();    //몽고디비였으면 safe.save();

    res.json({ transactionId: result.transactionId });
});

//TODO: sign multisig transaction API
//POST /v1/safe/:safe/:token/sign API
router.get('/:safe/:token/sign', async (req, res) => {
    const dbConn=conn.init();
    conn.connect(dbConn);

    const transactionId=req.body.transactionId;
    const userId=req.body.userId;
    const address=await conv.userToAddress(dbConn, userId);
    const safeAddress=req.params.safe;
    const tokenId=req.params.token;

    const result=await wallet.signMultisigTransaction(address, transactionId);

    //status가 Signed면 난 서명했지만 아직 더 서명할 게 남아있음. Submitted 상태면 모두 서명해서 트랜잭션이 제출됐다는 뜻
    if ('Submitted' === result.status) {
        //제출됐으므로 금고에서 해당 pending에 대한 tokenId 삭제하는 로직
        const doc=await Safe.findOne({ address: safeAddress });
        //몽고디비 아닌 mysql용으로 변경 필요함
        delete doc.pendings[tokenId];
        console.log(doc.pendings);

        doc.markModified('pendings');
        await doc.update();      //몽고디비였으면 safe.save();
    }
    conn.disconnect(dbConn);
    res.json({ status: 'ok' });
});

module.exports=router;