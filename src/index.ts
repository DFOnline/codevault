import Express, { json, NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const PORT = 8000;

// CREATE TABLE Templates (ID int NOT NULL PRIMARY KEY, Name varchar(32), Description varchar, Owner varchar(16), Icon varchar(32), Plot int, Rank int, Data varchar);
const DB  = new PrismaClient();
const APP = Express();

APP.get('/', (_req, res) => {
    res.send('ping');
});

const TemplateSchema = z.object({
    plotsize:    z.number().min(0).max(4 ),
    category:    z.string(),
    rank:        z.number().min(0).max(4 ),
    author:      z.string().min(3).max(16),
    name:        z.string(),
    lore:        z.string(),
    material:    z.string(),
    id:          z.number().min(0),
    data:        z.object({
        author:     z.string(),
        name:       z.string(),
        version:    z.number().min(0),
        code:       z.string()
    })
})

function auth(req : Request, res : Response, next : NextFunction) {
    // if(!req.headers['user-agent'].endsWith('i forgor')) { res.status(403).send(); return; }
    // if(req.ip !== '54.39.130.89') { res.status(403).send(); return; }
    next();
}
APP.post('/upload', auth, json(), async (req, res) => {
    const template = TemplateSchema.safeParse(req.body);
    if(!template.success) { res.status(400).send(); return; }
    const {id: ID, name: Name, lore: Description, author: Owner, material: Icon, plotsize: Plot, rank: Rank, data } = template.data;
    remove(ID);
    await DB.templates.create({data: {ID,Name,Description,Owner,Icon,Plot,Rank, Data: JSON.stringify(data)}});
    res.send();
});
APP.post('/remove', auth, json(), (req, res) => {
    console.log(req.body.id);
    res.send();
});

async function remove(id: number) {
    try {
        await DB.templates.delete({where: {ID: id}});
        return true;
    }
    catch {
        return false;
    }
}

APP.listen(PORT, () => {
    console.log(`App listening at port ${PORT}`);
});