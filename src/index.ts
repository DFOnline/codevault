import Express, { json, NextFunction, Request, Response, urlencoded } from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import { z } from 'zod';

const PORT = 8000;

// CREATE TABLE Templates (ID int NOT NULL PRIMARY KEY, Name varchar(32), Description varchar, Owner varchar(16), Icon varchar(32), Plot int, Rank int, Data varchar);
const DB  = new Sequelize({
    dialect: 'sqlite',
    storage: './dist/data.db',
    logging: false
});
const templates = DB.define('templates',{
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Name: DataTypes.STRING,
    Owner: DataTypes.STRING,
    Icon: DataTypes.STRING,
    Plot: DataTypes.TINYINT,
    Rank: DataTypes.TINYINT,
});
await DB.sync();
const APP = Express();

enum PlotSize {
    "Basic",
    "Large",
    "Massive",
}

enum RankName {
    "None",
    "Noble",
    "Mythic",
    "Overlord",
}

APP.get('/', async (_req, res) => {
    const data = await templates.findAll();
    res.send(Object.fromEntries(data.map(t => {
        const {ID, Name: name, Description: description, Owner: owner, Icon: icon} = t.get();
        const plot = PlotSize[t.get().Plot as number];
        const rank = RankName[t.get().Rank as number];
        return [ID, {name, description, owner, plot, rank, icon}]
    })));
});
APP.get('/:id', urlencoded({'extended': true}), async (req,res) => {
    const ID = req.params.id;
    if(ID == null) { res.status(400).send('No ID'); return; }
    const template = (await templates.findOne({where: {ID}}))?.get();
    if(template == null) { res.status(404).send(); return; }
    console.log(template);
    const {Name: name, Description: description, Owner: owner, Icon: icon} = template;
    const plot = PlotSize[template.Plot as number];
    const rank = RankName[template.Rank as number];
    const data = JSON.parse(template.Data as string);
    res.send({name,description,owner,icon,plot,rank,data});
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
});

function auth(req : Request, res : Response, next : NextFunction) {
    if(req.headers['user-agent']?.match(/DiamondFire\/\d.\d+ \(((21220)|(43780)), [a-zA-Z0-9_]{3,16}\)/) == null) { res.status(403).send(); return; }
    if(!(req.ip === '::1' || req.ip.includes('54.39.29.75'))) { res.status(403).send(); return; }
    next();
}
APP.post('/upload', auth, json(), async (req, res) => {
    const template = TemplateSchema.safeParse(req.body);
    if(!template.success) { res.status(400).send(); return; }
    const {id: ID, name: Name, lore: Description, author: Owner, material: Icon, plotsize: Plot, rank: Rank, data } = template.data;
    const dbtemplate = (await templates.findOne({where: {ID}}))?.get();
    const storedata = {ID,Name,Description,Owner,Icon,Plot,Rank, Data: JSON.stringify(data)}
    if(dbtemplate == null) {
        await templates.create(storedata);
    } else {
        templates.update(storedata,{'where':{ID}});
    }
    res.send();
});
APP.post('/remove', auth, json(), (req, res) => {
    remove(req.body.id);
    res.send();
});

async function remove(id: number) {
    try {
        await templates.destroy({where: {ID: id}});
        return true;
    }
    catch {
        return false;
    }
}

process.on('uncaughtException', e => {
    console.error(e);
})

APP.listen(PORT, () => {
    console.log(`App listening at port ${PORT}`);
});