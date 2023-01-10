import Express, { json } from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const PORT = 8000;

// const DB  = open({driver: sqlite3.Database, filename: '/dist/data.db'});
const APP = Express();

APP.get('/', (_req, res) => {
    res.send('ping');
});

APP.post('/upload', json(), (req, res) => {
    console.log(req.headers['user-agent']);
    console.log(req.body);
    res.send();
})

APP.listen(PORT, () => {
    console.log(`App listening at port ${PORT}`);
});