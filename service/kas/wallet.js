const ApiCaller=require('./api_caller');
const caver=require('caver-js')

class Wallet extends ApiCaller {
    constructor () {
        super('https://wallet-api.klaytnapi.com');
    }

    async createAccount () {
        const options={
            method: 'POST',
            url: '/v2/account',
            json: true,
        };

        return await this.call(options);
    }

    async sendTransfer (from, to, amount) {
        const peb=caver.utils.toPeb(amount, 'KLAY');
        const hexpeb=caver.utils.numberToHex(peb);

        const options={
            method: 'POST',
            url: '/v2/tx/fd/value',
            body: {
                from: from,
                to: to,
                value: hexpeb,
                submit: true,
            },
            json: true,
        };

        const res=await this.call(options);
        console.log(res);

        return res.transactionHash;
    }

    async updateAccountToMultisig (from, ownerPublicKey, publicKeys=[]) {
        const threshold=publicKeys.length+1;    //+1은 오너의 퍼블릭키 => 모든 사용자가 서명해야, multisig 트랜잭션이 실행됨
        const weightedKeys=[{ publicKey: ownerPublicKey, weight: 1, }].concat(
            Array.from(publicKeys, (el) => {
                return {
                    publicKey: el,
                    weight: 1,
                };
            }),
        );  //만약 가중치를 오너 + 1명 이상이고 싶으면, 오너의 가중치를 publicKeys의 length로 주고 threshold를 그에 맞게 설정하면 됨 => 구현하기 나름
        console.log(weightedKeys);

        const options={
            method: 'PUT',
            url: `/v2/account/${from}/multisig`,
            body: {
                threshold: threshold,
                weightedKeys: weightedKeys,
            },
            json: true,
        };

        const res=await this.call(options);
        console.log(res);

        return res;
    }

    async getMultisigTransactions (address) {
        const options={
            method: 'GET',
            url: `v2/multisig/account/${address}/tx`,
            qs: { size: '100' },
        };

        const res=await this.call(options);
        console.log(res);

        return res;
    }

    async signMultisigTransaction (address, transcationId) {
        console.log(`/v2/multisig/account/${address}/tx/${transcationId}/sign`);
        const options={
            method: 'POST',
            url: `/v2/multisig/account/${address}/tx/${transcationId}/sign`,
        };

        const res=await this.call(options);
        console.log(res);

        return res;
    }

    
}

const wallet=new Wallet();

module.exports=wallet;