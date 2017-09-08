const readline = require('readline'),
    fs = require('fs'),

    SPACE = "    ",
    SSL = " ssl ",
    ACL = "acl ",
    HDR_HOST = " hdr_end(host) ",
    FRONTEND = "frontend";

module.exports = (pathToFile) => {
    return new Promise((resolve, reject) => {
        const readStream = readline.createInterface({
            input: fs.createReadStream(pathToFile)
        });

        let isFrontEnd = false,
            isSsl = false,
            hostName = null,
            response = {};

        readStream.on('line', (line) => {
            if (isFrontEnd && line.indexOf(SPACE) !== 0 && line) {
                isFrontEnd = false;
                isSsl = false;
            }

            if (isFrontEnd) {
                if (line.indexOf(SSL) !== -1) {
                    isSsl = true;
                    hostName = line.trim().split(" ")[1].split(":")[0];
                    response[hostName] = {};
                }
            }

            if (isFrontEnd && isSsl)
                if (line.indexOf(ACL) !== -1 && line.indexOf(HDR_HOST) !== -1) {
                    let trimLine = line.trim();
                    let name = trimLine.split(" ")[1];

                    let arrayHosts = trimLine.slice(trimLine.indexOf(HDR_HOST)).split("-i");
                    arrayHosts.shift();
                    response[hostName][name] = arrayHosts;
                }

            if (line.indexOf(FRONTEND) !== -1) {
                isFrontEnd = true;
            }
        });

        readStream.on('close', () => {
            resolve(response);
        });

        readStream.input.on('error', (error) => {
            reject(error);
        });
    })
};