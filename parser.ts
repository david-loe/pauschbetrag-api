import { readdir, readFile } from "node:fs/promises";
import countries from "./data/countries.json" with { type: "json" };

const lumpsumTypes = ["overnight", "catering8", "catering24"] as const;
type LumpsumType = (typeof lumpsumTypes)[number];
type LumpSum = { [key in LumpsumType]: number };

export interface LumpSumWithSpecials extends LumpSum {
  specials?: ({
    city: string;
  } & LumpSum)[];
}

export interface CountryLumpSum extends LumpSumWithSpecials {
  validFrom: string;
  validUntil: string | null
  countryCode: string;
  lumpSumsFrom?: string;
}

type RawLumpSum = { country: string } & { [key in LumpsumType]: string };

type RawLumpSumWithCities = RawLumpSum & {
  specials?: ({ city: string } & { [key in LumpsumType]: string })[];
};

type LumpSumsJSON = { data: LumpSumWithCountryCode[]; validFrom: string; validUntil: string | null }[];
interface LumpSumWithCountryCode extends LumpSumWithSpecials {
  countryCode: string;
};
interface LumpSumWithCountryName extends LumpSumWithSpecials {
  country: string;
};

function isRawLumpSum(data: any): data is RawLumpSum {
  return typeof data.country === "string";
}

function assertAreRawLumpSums(data: any[]): asserts data is RawLumpSum[] {
  for (const item of data) {
    if (!isRawLumpSum(item)) {
      throw TypeError("Raw lump sums are of wrong type: " + item);
    }
  }
}

export async function parseLumpSumsFiles() {
  const lumpSums: LumpSumsJSON = [];
  const files = await readdir("./data");
  for (const file of files) {
    const matched = file.match(/(\d{4}-\d{2}-\d{2})\.tsv/i);
    if (matched && matched.length > 1) {
      const dataStr = await readFile("./data/" + file, "utf8");
      const validFrom = matched[1];
      const data = parseRawLumpSums(dataStr);
      lumpSums.push({ validFrom, validUntil: null, data });
    }
  }
  // sort descending by validFrom and add validUntil
  lumpSums.sort((a, b) => new Date(b.validFrom).valueOf() - new Date(a.validFrom).valueOf());
  for (let i = 1; i < lumpSums.length; i++) {
    lumpSums[i].validUntil = new Date(new Date(lumpSums[i - 1].validFrom).valueOf() - 86400000).toISOString().split('T')[0];
  }
  return lumpSums;
}

export function parseRawLumpSums(dataStr: string): LumpSumWithCountryCode[] {
  const refinedString = fixTableSpezialties(dataStr);
  const data = csvToObjects(refinedString, "\t", ",", "");
  assertAreRawLumpSums(data);
  const rawLumpSums = combineSpecials(data);
  const lumpSums: LumpSumWithCountryCode[] = [];
  for (const rawLumpSum of rawLumpSums) {
    lumpSums.push(findCountryCode(convertRawLumpSum(rawLumpSum)));
  }
  return lumpSums;
}

function combineSpecials(
  rawLumpSums: (RawLumpSum & { city?: string })[]
): RawLumpSumWithCities[] {
  const general = /im Übrigen/i;
  const specialstart = /^–\s+(.*)/i;
  var specials = [];
  for (var i = rawLumpSums.length - 1; i >= 0; i--) {
    const matched = rawLumpSums[i].country.match(specialstart);
    if (matched && matched.length > 1) {
      rawLumpSums[i].city = matched[1];
      delete (rawLumpSums[i] as any).country;
      specials.push(rawLumpSums[i]);
      rawLumpSums.splice(i, 1);
    } else if (specials.length > 0) {
      for (var j = specials.length - 1; j >= 0; j--) {
        if (general.test(specials[j].city as string)) {
          delete specials[j].city;
          Object.assign(rawLumpSums[i], specials[j]);
          specials.splice(j, 1);
          break;
        }
      }
      (rawLumpSums[i] as any).specials = specials;
      specials = [];
    }
  }
  return rawLumpSums;
}

function findCountryCode(
  lumpSum: LumpSumWithCountryName
): LumpSumWithCountryCode {
  var countryCode: null | string = null;
  for (const c of countries) {
    if (c.names.indexOf(lumpSum.country) !== -1) {
      countryCode = c.code;
    }
  }
  if (!countryCode) {
    throw new Error('"' + lumpSum.country + '" not found!');
  }
  const lumpSumWithCode: LumpSumWithCountryCode = Object.assign(lumpSum, {
    countryCode,
    country: undefined,
  });
  return lumpSumWithCode;
}

function convertRawLumpSum(raw: RawLumpSumWithCities): LumpSumWithCountryName {
  const specials: LumpSumWithSpecials["specials"] = [];
  if (raw.specials) {
    for (const spezial of raw.specials) {
      specials.push({
        catering24: parseInt(spezial.catering24, 10),
        catering8: parseInt(spezial.catering8, 10),
        overnight: parseInt(spezial.overnight, 10),
        city: spezial.city,
      });
    }
  }

  return {
    country: raw.country,
    catering24: parseInt(raw.catering24, 10),
    catering8: parseInt(raw.catering8, 10),
    overnight: parseInt(raw.overnight, 10),
    specials,
  };
}

/**
 * @returns Array of JS Objects
 */
export function csvToObjects(
  csv: string,
  separator = "\t",
  arraySeparator = ", ",
  resultForEmptyString: any = undefined
): { [key: string]: string | string[] }[] {
  var lines = csv.split("\n");
  var result = [];
  var headers = lines[0].split(separator);
  for (var i = 1; i < lines.length; i++) {
    var obj: { [key: string]: string | string[] } = {};
    if (lines[i] === "") {
      break;
    }
    var currentline = lines[i].split(separator);
    if (currentline.length !== headers.length) {
      throw new Error(
        "Line (#" + (i + 1) + ") has other length than header: " + lines[i]
      );
    }
    for (var j = 0; j < headers.length; j++) {
      // search for [] to identify arrays
      const match = currentline[j].match(/^\[(.*)\]$/);
      if (match === null) {
        if (currentline[j] === "") {
          obj[headers[j]] = resultForEmptyString;
        } else {
          obj[headers[j]] = currentline[j];
        }
      } else {
        obj[headers[j]] = match[1].split(arraySeparator);
      }
    }
    result.push(obj);
  }
  return result;
}

function fixTableSpezialties(dataStr: string) {
  // Remove empty Lines
  var result = dataStr.replace(/^\t+\n/gm, "");

  // Remove line breaks inside quotes
  const lineBreaks = /".*(\n).*"/dgm;
  var match: RegExpExecArray | null;
  while ((match = lineBreaks.exec(result)) !== null) {
    if (match.indices) {
      const m = match.indices[1];
      result = result.slice(0, m[0]) + " " + result.slice(m[1]);
    }
  }
  //Remove quotes
  var result = result.replace(/"/gm, "");

  return result;
}
