const request=require('request');

class ApiCaller {
    constructor (_endpoint) {
        this.endpoint=_endpoint;
    }

    async call (options) {
        options.url=this.endpoint+options.url;
        options.json=true;

        if (!options.headers) options.headers={};

        options.headers['x-chain-id']='1001';
        options.headers['content-type']='application/json';
        options.headers.Authorization='Basic kas-credential';   //자신의 kas 계정으로 로그인 해서 생성한 credential 넣어주면 되는 부분

        return new Promise ((resolve, reject) => {
            request (options, (error, _response, body) => {
                if (error) reject(error);
                else resolve(body);
            });
        });
    }

    //JSON RPC 호출
    async rpcCall (method, params=[]) {
        const options = {
            method: 'POST',
            url: 'https://node-api.klaytnapi.com/v1/klaytn',
            headers: {
                'Content-Type': 'application/json',
                'x-chain-id': '1001',
                Authorization: 'Basic kas-credential',
            },
            body: {
                id: 1,
                jsonrpc: '2.0',
                method: method,
                params: params,
            },
            json: true,
        };

        return new Promise ((resolve, reject) => {
            request (options, (error, _response, body) => {
                if (error) reject(error);
                else {
                    if (body.result) resolve(body);
                    else resolve(null);
                }
            });
        });
    }
}

module.exports=ApiCaller;