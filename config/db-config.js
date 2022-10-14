const mysql=require('mysql');

const config={
    host: 'localhost',
    user: 'user_name',
    password: 'pw',
    database: 'schema_name'
};

const conn={
    init: function () {
        return mysql.createConnection(config);
    },

    connect: function (conn) {
        conn.connect((err) => {
            if (err) console.error('mysql connection error: ' + err);
            else console.log('mysql connection success');
        });
    },

    disconnect: function (conn) {
        conn.end((err) => {
            if (err) console.error('mysql disconnection error: ' + err);
            else console.log('mysql disconnection success');
        });
    },

    select: async function (conn, queryText) {
        let result=null;
        result=await new Promise((resolve) => {
            conn.query(queryText, (err, res, fields) => {
                if (err) {
                    console.error('mysql select query error: ' + err);
                }
                else {
                    console.log(res);
                    resolve(res);
                }
            });
        });
        return result;
    },

    insert: function (conn, queryText, data) {
        conn.query(queryText, data, (err, res, fields) => {
            if (err) console.error('mysql insert query error: ' + err);
            else console.log(res);
        });
    },

    insertRetId: async function (conn, queryText, data) {
        let result=null;
        result=await new Promise((resolve) => {
            console.log('start insertTestId promise');
            conn.query(queryText, data, (err, res, fields) => {
                if (err) {
                    console.error('mysql insertRetId query error: ' + err);
                }
                else {
                    console.log(res);
                    resolve(res);
                }
            });
        });
        return result;
    },
}

module.exports=conn;