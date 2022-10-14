const { NULL } = require('mysql/lib/protocol/constants/types');
const conn=require('../config/db-config');

//TODO: define safe money data schema
class Safe {
    static table='noriwallet.nw_tb_safemoney'
    constructor (safe) {
        this.name=safe.name;               //String
        this.address=safe.address;          //String
        this.publicKey=safe.publicKey;      //String
        this.image=safe.image;              //String
        this.tokenId=safe.tokenId;          //String
        this.creator=safe.creator;          //String
        this.attendees=safe.attendees;      //Array
        this.pendings=0;     //Object
    }

    async save (dbConn) {
        console.log(this);
        const query=`INSERT INTO ${Safe.table} (name, address, public_key, image, token_id, creator, attendees, pendings) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const data=[this.name, this.address, this.publicKey, this.image, this.tokenId, this.creator, this.attendees, this.pendings];
        conn.insert(dbConn, query, data);
    }

    static async findByName (dbConn, userId) {
        const attendees=userId.attendees
        const query=`SELECT name, address, image, creator, attendees FROM ${Safe.table} WHERE attendees LIKE '% ${attendees} %' OR creator='${attendees}'`;
        const ret=await conn.select(dbConn, query);

        return ret;
    }

    static async find (dbConn, pattern) {
        const query=`SELECT name FROM ${Safe.table} WHERE name LIKE '${pattern}%'`
        const res=await conn.select(dbConn, query);

        return res;
    }

    static async findOne (dbConn, safe) {
        const safeAddress=safe.address;
        const query=`SELECT id, name, image, creator, attendees FROM ${Safe.table} WHERE address='${safeAddress}'`;
        const ret=await conn.select(dbConn, query);

        return ret[0];
    }

    async update () {
        //여기서 this.어찌고들 이용해서 update 처리
    }
}

module.exports=Safe;