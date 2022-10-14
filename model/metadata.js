const conn=require('../config/db-config');

//TODO: metadata schema
class Metadata {
    static table='noriwallet.nw_tb_metadata'
    constructor (data) {
        this.name=data.name;
        this.description=data.description;
        this.kind=data.kind;
        this.image=data.image;
    }

    async save (dbConn) {
        console.log('this table');
        console.log(this.table);
        const query=`INSERT INTO ${Metadata.table} (name, description, kind, image) VALUES (?, ?, ?, ?)`;
        const data=[this.name, this.description, this.kind, this.image];
        console.log('query: ' + query);
        console.log('data: '); console.log(data);
        const id=await conn.insertRetId(dbConn, query, data);

        return id;
    }

    static async findById (dbConn, id) {
        const query=`SELECT * FROM ${Metadata.table} WHERE id=${id}`;
        const ret=await conn.select(dbConn, query);

        return ret[0];
    }
}

module.exports=Metadata;