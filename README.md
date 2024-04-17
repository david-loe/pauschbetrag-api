# pauschbetrag-api
Pauschbeträge für Verpflegungsmehraufwendungen und Übernachtungskosten für beruflich und betrieblich veranlasste Auslandsdienstreisen.

## Usage

`https://cdn.jsdelivr.net/npm/pauschbetrag-api@latest/{COUNTRY}.json`
```
COUNTRY ::= ISO 3166-1 alpha-2 code (e.g. US)
          | ALL
```

### Example

`https://cdn.jsdelivr.net/npm/pauschbetrag-api@latest/US.json`

or

`https://cdn.jsdelivr.net/npm/pauschbetrag-api@latest/ALL.json`

## Source

- Deutschland:
    - Verpflegung [§9 Abs. 4a S. 3 EStG](https://www.gesetze-im-internet.de/estg/__9.html)
    - Übernachtung [§7 Abs. 1 BRKG](https://www.gesetze-im-internet.de/brkg_2005/__7.html)
- Ausland: *Steuerliche Behandlung von Reisekosten und Reisekostenvergütungen*
    - [2023](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Lohnsteuer/2022-11-23-steuerliche-behandlung-reisekosten-reisekostenverguetungen-2023.pdf)
    - [2024](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Lohnsteuer/2023-11-21-steuerliche-behandlung-reisekosten-reisekostenverguetungen-2024.pdf)
