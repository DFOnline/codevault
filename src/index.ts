import Express from 'express';

const PORT = 8000

const APP = Express();

APP.get('/', (_req, res) => {
    res.send('ping');
})

APP.listen(PORT, () => {
    console.log(`App listening at port ${PORT}`);
});