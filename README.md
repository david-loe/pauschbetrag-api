# pauschbetrag-api

[![](https://data.jsdelivr.com/v1/package/npm/pauschbetrag-api/badge)](https://www.jsdelivr.com/package/npm/pauschbetrag-api)

Pauschbeträge für Verpflegungsmehraufwendungen und Übernachtungskosten für beruflich und betrieblich veranlasste Auslandsdienstreisen.

## Usage

`https://cdn.jsdelivr.net/npm/pauschbetrag-api@1/{COUNTRY}.json`

```
COUNTRY ::= ISO 3166-1 alpha-2 code (e.g. US)
          | ALL
```

### Example

`https://cdn.jsdelivr.net/npm/pauschbetrag-api@1/US.json`

or

`https://cdn.jsdelivr.net/npm/pauschbetrag-api@1/ALL.json`

## Schema

### V1.1

#### /{COUNTRY}.json

```ts
Array<{
  catering24: number
  catering8: number
  overnight: number
  countryCode: string //ISO 3166-1 alpha-2 code
  validFrom: string //YYYY-MM-DD
  validUntil: string | null //YYYY-MM-DD - null if latest
  specials: Array<{
    catering24: number
    catering8: number
    overnight: number
    city: string
  }>
}>
```

#### /ALL.json

```ts
Array<{
  validFrom: string //YYYY-MM-DD
  validUntil: string | null //YYYY-MM-DD - null if latest
  data: Array<{
    catering24: number
    catering8: number
    overnight: number
    countryCode: string //ISO 3166-1 alpha-2 code
    specials: Array<{
      catering24: number
      catering8: number
      overnight: number
      city: string
    }>
  }>
}>
```

## Source

- Deutschland:
  - Verpflegung [§9 Abs. 4a S. 3 EStG](https://www.gesetze-im-internet.de/estg/__9.html)
  - Übernachtung [§7 Abs. 1 BRKG](https://www.gesetze-im-internet.de/brkg_2005/__7.html)
- Ausland: _Steuerliche Behandlung von Reisekosten und Reisekostenvergütungen_
  - [2023](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Lohnsteuer/2022-11-23-steuerliche-behandlung-reisekosten-reisekostenverguetungen-2023.pdf)
  - [2024](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Lohnsteuer/2023-11-21-steuerliche-behandlung-reisekosten-reisekostenverguetungen-2024.pdf)
  - [2025](https://www.finanzamt.bayern.de/Informationen/Steuerinfos/Weitere_Themen/Auslandssachverhalte/Auslandsreisekosten-2025.pdf)
  - [2026](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Lohnsteuer/2025-12-05-steuerliche-behandlung-reisekosten-2026.pdf)

[Workflow](./workflow)
