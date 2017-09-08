const express = require('express'),
    fileUpload = require('express-fileupload'),
    parser = require('./helpers/cfg-parser.js'),
    app = express();

app.use(express.static(__dirname));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

app.post('/upload', (req, res) => {
    let uploadPromise = new Promise((resolve, reject) => {
        if (!req.files) {
            reject('No files were uploaded.');
        }

        let sampleFile = req.files.sampleFile;
        sampleFile.mv(`./uploads/${sampleFile.name}`, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(sampleFile.name);
            }
        });
    });

    uploadPromise.then((fileName) => {
        let pathToFile = `${__dirname}/uploads/${fileName}`;
        parser(pathToFile)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                res.status(500).send(err);
            })

    }).catch((err) => {
        res.status(500).send(err);
    })
});

const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log(`Listening on ${port}`);
});
