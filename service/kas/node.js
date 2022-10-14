const caver=require('caver-js')
const ApiCaller=require('./api_caller')

class Node extends ApiCaller {
    constructor () {
        super('https://node-api.klaytnapi.com');
    }

    async getBalance (address) {
        const options={
            method: 'POST',
            url: '/v1/klaytn',

            body: {
                id: 1,
                jsonrpc: '2.0',
                method: 'klay_getBalance',
                params: [address, 'latest'],
            },
            json: true,
        };

        const ret=await this.call(options);
        let klay='0';
        
        if (ret.result) {
            const peb=caver.utils.hexToNumberString(ret.result);
            klay=caver.utils.fromPeb(peb, 'KLAY');
        }

        return klay;
    }

    // async getBalance (address) {
    //     const ret=await this.rpcCall('klay_getBalance', [adress, 'latest']);
    //     let klay='0';
    //     if (ret) {
    //         const peb=caver.utils.hexToNumberString(ret);
    //         klay=caver.utils.fromPeb(peb, 'KLAY');
    //     }

    //     return klay;
    // }

    async getReceipt (txHash) {
        return await this.rpcCall('klay_getTransactionReceipt', [txHash]);
    }
}

const node=new Node();

module.exports=node;