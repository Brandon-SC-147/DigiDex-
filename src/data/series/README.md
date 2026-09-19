# Dataset local de series (`src/data/series/`)

Asociaciones curadas a mano entre series/proyectos Digimon y Digimon de Digi-API.

## Fuentes verificadas

- Años de emisión: Toei Animation (Beatbreak, oct. 2025), Wikipedia (Tamers 2001–2002,
  Ghost Game oct. 2021 – mar. 2023, Beatbreak oct. 2025 – sep. 2026),
  Fuji TV (Ghost Game 2021–2023), IMDb (Savers 2006–2007), Anime News Network,
  DigimonWiki/Fandom (Adventure 1999, 02 2000, Frontier 2002, Xros 2010, Appmon 2016).
- Liberator: sitio oficial digimoncard.com + comunidad With the Will
  (web novel desde mayo de 2024, manga en curso).
- IDs de Digimon: verificados 1:1 contra `https://digi-api.com/api/v1`
  (búsquedas por nombre e inspección de `priorEvolutions`/`nextEvolutions`).

## Criterio

- Solo socios principales y personajes centrales de cada serie.
- `featuredIds` usa **IDs reales de Digi-API**, nunca nombres como identificador.
- Relación many-to-many: un Digimon puede aparecer en varias series.
- Calidad > cantidad: sin asociaciones dudosas.

## Limitaciones conocidas

- `Gatchmon`, `Dokamon`, `Musimon`, `Offmon` no existen en Digi-API:
  App Monsters queda representada solo con Hackmon (id 1156).
- `Digimon Beatbreak` (TV, desde oct. 2025) se excluye de v1 a propósito:
  su roster aún se está consolidando; se agregará cuando sea verificable.
- Las agrupaciones `classics` / `new-eras` / `recent` son **visuales e internas
  de DigiDex**, no una clasificación oficial.
