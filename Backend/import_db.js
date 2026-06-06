const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

// Connection details
const connectionConfig = {
    host: 'acela.proxy.rlwy.net',
    port: 56401,
    user: 'root',
    password: 'NdUhMhBezvjkypoeQDmupEejxZKzGwBc',
    database: 'railway',
    multipleStatements: true // Allows running multiple queries at once
};

console.log('Connecting to Railway MySQL database...');
const connection = mysql.createConnection(connectionConfig);

connection.connect((err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
        process.exit(1);
    }
    console.log('Successfully connected to database!');

    // Read store.sql file
    const sqlPath = '../store.sql';
    console.log(`Reading SQL schema from ${sqlPath}...`);
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Remove the database creation and usage statements since Railway pre-allocated the 'railway' database
    sqlContent = sqlContent.replace(/create database store;/gi, '');
    sqlContent = sqlContent.replace(/use store;/gi, '');

    console.log('Executing SQL statements to create tables...');
    connection.query(sqlContent, (err, results) => {
        if (err) {
            console.error('Error executing SQL queries:', err.message);
        } else {
            console.log('Tables created successfully!');
            console.log('Results:', results);
        }
        connection.end();
    });
});
