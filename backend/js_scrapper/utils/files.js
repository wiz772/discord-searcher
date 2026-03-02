const fs = require("fs/promises");
const path = require("path");

async function writeFile(dir, fileName, data) {
    try {
        await fs.mkdir(dir, { recursive: true });

        const filePath = path.join(dir, fileName);
        const json = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, json, "utf-8");
        console.log(`Batch écrit dans ${filePath}`);
    } catch (err) {
        console.error("Erreur écriture :", err);
    }
}

module.exports = { writeFile };