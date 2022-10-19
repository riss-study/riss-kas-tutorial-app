const ApiCaller=require('./api_caller');
const process=require('process');

class Kip17 extends ApiCaller {
    contract='contract_name';

    constructor () {
        super('https://kip17-api.klaytnapi.com');
    }

    async issueToken (address, id, uri) {
        const options={
            method: 'POST',
            url: `/v2/contract/${this.contract}/token`,
            body: {
                to: address,
                id: id,
                uri: uri,
            },
            json: true,
        };

        const res=await this.call(options);
        console.log(res);
    }

    async listTokens (address) {
        const options={
            method: 'GET',
            url: `/v2/contract/${this.contract}/owner/${address}`,
        };

        const res=await this.call(options);
        console.log(res);

        return res.items;   //나중에 token이 많아질 때를 대비하여 cursor도 받아서 조정해주는 수정이 필요함
    }

    async sendToken (address, tokenId, to) {
        const options = {
            method: 'POST',
            url: `/v2/contract/${this.contract}/token/${tokenId}`,
            body: {
              sender: address,
              owner: address,
              to: to,
            },
            json: true,
        };

        const res=await this.call(options);
        console.log(res);

        return res;
    }
}

const kip17=new Kip17();
module.exports=kip17;
