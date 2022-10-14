const conn=require('../config/db-config');

class User {
    static table='noriwallet.nw_tb_user'
    constructor (user) {
        this.name=user.name;
        this.address=user.address;
        this.password=user.password;
        this.publicKey=user.publicKey;
    }

    save (dbConn) {
        const query=`INSERT INTO ${User.table} (name, address, password, publicKey) VALUES (?, ?, ?, ?)`;
        const data=[this.name, this.address, this.password, this.publicKey];
        conn.insert(dbConn, query, data);
    }

    static async findAddressOne (dbConn, user) {
        const userId=user.name;
        console.log('userId: ', userId)
        const query=`SELECT address FROM ${User.table} WHERE name='${userId}'`;
        const res=await conn.select(dbConn, query);

        return res[0];
    }

    static async find (dbConn, pattern) {
        const query=`SELECT name FROM ${User.table} WHERE name LIKE '${pattern}%'`
        const res=await conn.select(dbConn, query);

        return res;
    }

    static async findUserOne (dbConn, user) {
        const userAddress=user.address;
        const query=`SELECT name FROM ${User.table} WHERE address='${userAddress}'`;
        const res=await conn.select(dbConn, query);

        return res[0];
    }

    static async findByName (dbConn, user) {
        const userName=user.name;
        const query=`SELECT * FROM ${User.table} WHERE name='${userName}'`;
        const res=await conn.select(dbConn, query);

        return res;
    }

    static async findByAddress (dbConn, user) {
        const userAddress=user.address;
        const query=`SELECT * FROM ${User.table} WHERE name='${userAddress}'`;
        const res=await conn.select(dbConn, query);

        return res;
    }
}

module.exports=User;