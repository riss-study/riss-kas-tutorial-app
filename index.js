const bodyParser=require('body-parser');
const express=require('express');
const user=require('./controller/user');
const search=require('./controller/search');
const asset=require('./controller/asset');
const metadata=require('./controller/metadata');
const safe=require('./controller/safe');
const test=require('./controller/test'); //test

const port=9998;

const app=express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true } ));
app.use(express.static('public'));
app.use('/v1/user', user);
app.use('/v1/search', search);
app.use('/v1/asset', asset);
app.use('/v1/metadata', metadata);
app.use('/v1/safe', safe);
app.use('/test', test); //test

app.listen(port, () => {
    console.log('This app is made by RISS');
    console.log('reference: Klaytn Youtube');
    console.log(`Example app listening at http://localhost:${port}`);
});