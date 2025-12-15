import { parseLumpSumsFiles, CountryLumpSum } from "./parser.js";
import countries from './data/countries.json'  with { type: 'json' }
import packageJSON from './package.json'  with { type: 'json' }
import { buildVersion, writeToDisk } from "./util.js";
import { copyFile } from 'node:fs/promises';
import DE from "./data/DE.json" with { type: "json" };


const allLumpSums = await parseLumpSumsFiles()

for (const country of countries) {
    const lumpSums: CountryLumpSum[] = []
    for (const ls of allLumpSums) {
        for (const c of ls.data) {
            if (c.countryCode === country.code) {
                lumpSums.push({...c,  validFrom: ls.validFrom, validUntil: ls.validUntil  })
            } else if(country.lumpSumsFrom && c.countryCode === country.lumpSumsFrom){
                lumpSums.push({...c,  validFrom: ls.validFrom, validUntil: ls.validUntil, countryCode:country.code, lumpSumsFrom: country.lumpSumsFrom, specials: [] })
            }
        }
    }
    await writeToDisk('package/' + country.code + '.json', JSON.stringify(lumpSums))
}

await copyFile('data/DE.json', 'package/DE.json');

//add DE to allLumpSums
for (const ls of allLumpSums) {
    let entry = null
    for (const deEntry of DE) {
        const deValidFrom = new Date(deEntry.validFrom)
        const deValidUntil = deEntry.validUntil ? new Date(deEntry.validUntil) : null
        const lsValidFrom = new Date(ls.validFrom)
        const lsValidUntil = ls.validUntil ? new Date(ls.validUntil) : null
        if(lsValidFrom >= deValidFrom) {
            if(!deValidUntil || (lsValidUntil && deValidUntil >= lsValidUntil)) {
                entry = deEntry
                break
            }
        }
    }
    if(entry){
        ls.data.push(Object.assign(entry, { countryCode: 'DE' }))
    }
}
await writeToDisk('package/ALL.json', JSON.stringify(allLumpSums))

var latest = ''
for (const lumpSum of allLumpSums) {
    if (!latest) {
        latest = lumpSum.validFrom
    } else {
        latest = new Date(lumpSum.validFrom).valueOf() > new Date(latest).valueOf() ? lumpSum.validFrom : latest
    }
}

await writeToDisk('package/package.json', JSON.stringify(Object.assign(packageJSON, { version: buildVersion(packageJSON.version, latest), devDependencies: undefined })))
await writeToDisk('package/index.js', '')
await copyFile('README.md', 'package/README.md');