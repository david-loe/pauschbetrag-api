import { parseLumpSumsFiles, CountryLumpSum } from "./parser.js";
import countries from './data/countries.json'  with { type: 'json' }
import packageJSON from './package.json'  with { type: 'json' }
import { writeToDisk } from "./util.js";


const allLumpSums = await parseLumpSumsFiles()
await writeToDisk('package/ALL.json', JSON.stringify(allLumpSums))

for (const country of countries) {
    const lumpSums: CountryLumpSum[] = []
    const lumpSumCode = country.lumpSumsFrom || country.code
    for (const ls of allLumpSums) {
        for (const c of ls.data) {
            if (c.countryCode === lumpSumCode) {
                lumpSums.push(Object.assign(c, { validFrom: ls.validFrom, lumpSumsFrom: country.lumpSumsFrom }))
            }
        }
    }
    writeToDisk('package/' + country.code + '.json', JSON.stringify(lumpSums))
}

var latest = ''
for (const lumpSum of allLumpSums) {
    if (!latest) {
        latest = lumpSum.validFrom
    } else {
        latest = new Date(lumpSum.validFrom).valueOf() > new Date(latest).valueOf() ? lumpSum.validFrom : latest
    }
}

writeToDisk('package/package.json', JSON.stringify(Object.assign(packageJSON, { version: packageJSON.version + '-' + latest, devDependencies: undefined })))
writeToDisk('package/index.js', '')