import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/build')));

const withDB = async (operation, res) => {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017', {
      useNewUrlParser: true,
    });
    const db = client.db('articals');
    await operation(db);
    client.close();
  } catch (e) {
    res.status(500).json({ message: 'Error to connect', e });
  }
};

app.get('/api/articals/:name', async (req, res) => {
  withDB(async db => {
    const articalName = req.params.name;
    const articalsInfo = await db
      .collection('name')
      .findOne({ name: articalName });
    res.status(200).json(articalsInfo);
  }, res);
});

//update upvotes
app.post('/api/articals/:name/upvote', async (req, res) => {
  withDB(async db => {
    const articalName = req.params.name;
    const articalInfo = await db
      .collection('name')
      .findOne({ name: articalName });
    await db.collection('name').updateOne(
      { name: articalName },
      {
        $set: {
          upvotes: articalInfo.upvotes + 1,
        },
      },
    );
    const updateArticalInfo = await db
      .collection('name')
      .findOne({ name: articalName });
    res.status(200).json(updateArticalInfo);
  }, res);

  // articaInfo[articalName].upvote += 1;
  // res.send(`we ${articalName} has ${articaInfo[articalName].upvote}`);
});

//add commend to save db
app.post('/api/articals/:name/add-comment', async (req, res) => {
  withDB(async db => {
    const { username, note } = req.body;
    const articalName = req.params.name;

    const articalInfo = await db
      .collection('name')
      .findOne({ name: articalName });
    await db.collection('name').updateOne(
      { name: articalName },
      {
        $set: {
          comments: articalInfo.comments.concat({ username, note }),
        },
      },
    );
    const updateArticalInfo = await db
      .collection('name')
      .findOne({ name: articalName });

    res.status(200).json(updateArticalInfo);
  }, res);
});

// app.get('/hello', (req, res) => res.send('hello'));
// app.get('/hello/:name', (req, res) => res.send(`hello ${req.params.name}`));
// app.post('/hello', (req, res) => res.send(`hello ${req.body.name}`));

//addcoment
// app.post('/api/articals/:name/add-commend', (req, res) => {
//   const { name, note } = req.body;
//   const articalName = req.params.name;
//   articaInfo[articalName].commends.push({ name, note });

//   res.status(200).send(articaInfo[articalName]);
// });
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname + '/build/index.html')),
);
app.listen(8000, () => console.log('Listen to port 8000'));
