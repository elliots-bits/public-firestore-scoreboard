// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const functions = require("firebase-functions");

const express = require('express');
const cors = require('cors');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// example:
// curl https://functionaddress/kario-mart/100 -> Returns best 100 scores for the game kario-mart
app.get('/:game/:nTop', async (req, res) => {
    const fs = admin.firestore();
    const collection = fs.collection(req.params.game);
    if (collection === undefined) {
        return res.send([]);
    } else {
        const snapshot = await collection.orderBy('score', 'desc').limit(Number.parseInt(req.params.nTop)).get();
        const documents = [];
        snapshot.forEach(doc => {documents.push(doc.data())});
        return res.send(documents);
    }
});


// example:
// curl -X PUT https://functionaddress/kario-mart/elliot/2844 -> Insert score 2844 for player elliot in game kario-mart
app.put('/:game/:playerNick/:score', async (req, res) => {
    const fs = admin.firestore();
    const collection = fs.collection(req.params.game);
    const data = req.body.data;

    if (collection === undefined) {
        return res.status(400).send("This game does not exist.");
    } else {
        const newScoreRef = collection.doc();
        const dbRes = await newScoreRef.set({
            playerNick: req.params.playerNick,
            score: Number.parseInt(req.params.score),
            data: data || null,
        })
        return res.status(201).send("Ok");
    }
});

// Expose Express API as a single Cloud Function:
exports.scores = functions.https.onRequest(app);
