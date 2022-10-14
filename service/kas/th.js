const ApiCaller=require('./api_caller');

class TokenHistory extends ApiCaller {
    constructor () {
        super('https://th-api.klaytnapi.com');
    }

    async klayHistory (address, tStart, tEnd) {
        const options={
            method: 'GET',
            url: `/v2/transfer/account/${address}`,
            qs: {
                kind: 'klay',   //실제 코드에서는 size도 넣을 것
            },
        };

        if (tStart && tEnd) options.qs.range=`${tStart}, ${tEnd}`;
        var res=await this.call(options);
        console.log(res);
        const history=[...res.items];

        //실제 코드에서는 cursor를 제한 두어서 client에 보여주는 방향으로 짤 것
        while ('' != res.cursor) {
            options.qs.cursor=res.cursor;
            res=await this.call(options);
            history.push(...res.items);
        }

        return history;
    }
}

const th=new TokenHistory();

module.exports=th;