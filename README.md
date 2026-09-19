# DigiDex

> Enciclopedia web moderna del universo Digimon.

DigiDex es una enciclopedia web interactiva desarrollada con Astro para explorar el universo Digimon mediante información obtenida desde Digi-API.

Esta nueva generación del proyecto amplía el concepto original de DigiDex, pasando de una colección limitada a una experiencia preparada para explorar una base de datos mucho más completa, incluyendo niveles, atributos, tipos, habilidades y relaciones evolutivas cuando la API las proporciona.

> **Nota:** "Nueva generación" hace referencia a la evolución técnica del proyecto, no a una generación específica de Digimon.

DigiDex utiliza Digi-API, una fuente pública con más de mil registros de Digimon y datos detallados.

## Evolución del proyecto

### Primera generación

Repositorio histórico:

https://github.com/Brandon-SC-147/DigiDex-Adventure

Primera versión funcional de DigiDex, conservada como registro histórico del proyecto. No fue reemplazada ni eliminada, y se mantiene intacta como recuerdo de la primera generación.

### Nueva generación

Repositorio actual:

https://github.com/Brandon-SC-147/DigiDex-

Nueva etapa del proyecto, construida sobre Astro y orientada a convertirse en una enciclopedia más completa, escalable y moderna del universo Digimon. La nueva DigiDex busca cubrir múltiples generaciones, series, variantes y líneas evolutivas del universo Digimon.

## Funcionalidad actual

- Interfaz web construida con Astro.
- Catálogo de Digimon.
- Búsqueda por nombre.
- Vista individual de Digimon.
- Integración con API pública.
- Diseño responsive.
- Manejo de carga y errores.
- Servicio centralizado para acceso a datos.
- Interfaz orientada a escritorio, tablet y móvil.

## Evolución planificada

- Migración completa a Digi-API.
- Catálogo ampliado.
- Paginación desde servidor.
- Filtros avanzados.
- Navegación mediante ID.
- Fichas con skills.
- Tipos y atributos.
- Evoluciones anteriores y posteriores.
- Selector ES / EN.
- Traducción visual al español.
- Sección independiente para explorar series / generaciones.
- Mejoras de accesibilidad y experiencia móvil.

## API

Fuente principal de datos:

```
https://digi-api.com/api/v1
```

Digi-API puede proporcionar, dependiendo del Digimon:

| Campo | Descripción |
| ----- | ----------- |
| ID | Identificador único del Digimon. |
| Nombre | Nombre de la criatura. |
| Imágenes | Arte oficial del Digimon. |
| Niveles | Etapa de evolución. |
| Tipos | Clasificación (Reptil, Mamífero, etc.). |
| Atributos | Vaccine, Virus, Data, etc. |
| Fields | Familias del Mundo Digital. |
| Descripción | Texto descriptivo. |
| Skills | Habilidades con descripción. |
| Evoluciones anteriores | De qué Digimon puede venir. |
| Evoluciones siguientes | A qué Digimon puede evolucionar. |
| Variantes | Versiones alternativas. |
| X-Antibody | Marca si porta el Anticuerpo X. |

DigiDex consume únicamente la información realmente disponible en la API y no inventa datos ausentes.

## Tecnologías

- Astro 5 (sitio estático)
- JavaScript
- HTML5
- CSS
- Fetch API (sin Axios)

## Estructura del proyecto

```
public/
├── favicon.svg          # Favicon propio
├── official-logo.png    # Logo del sitio oficial de Digimon
└── backgrounds/
src/
├── components/
│   ├── DigimonCard.astro
│   └── DigimonFilter.astro
├── layouts/
│   └── Layout.astro
├── pages/
│   ├── index.astro
│   ├── dex/
│   │   ├── index.astro
│   │   └── [name].astro
│   └── 404.astro
├── services/
│   └── digimonService.js
└── styles/
    └── global.css
```

## Rutas

| Ruta | Descripción |
| ---- | ----------- |
| `/` | Pantalla de bienvenida. |
| `/dex` | Catálogo principal. |
| `/dex/:name` | Detalle del Digimon (prerenderizado). |

### Rutas previstas

Arquitectura futura, todavía no implementada:

- Navegación de fichas mediante ID.
- Sección independiente de series / generaciones.
- Selector de idioma ES / EN.

## Instalación

```bash
git clone https://github.com/Brandon-SC-147/DigiDex-.git
cd DigiDex-
npm install
npm run dev
```

El servidor de desarrollo corre en `http://localhost:4321`.

## Compilar para producción

```bash
npm run build
```

## Vista previa de producción

```bash
npm run build
npm run preview
```

## Roadmap breve

- [x] Base Astro del proyecto
- [x] Catálogo y ficha individual
- [ ] Migración completa a Digi-API
- [ ] Paginación y filtros avanzados
- [ ] Evoluciones y fichas enriquecidas
- [ ] Selector ES / EN
- [ ] Sección de series / generaciones

## Autor

Brandon Valenzuela

## Disclaimer

DigiDex es un proyecto fan desarrollado con fines educativos, académicos y de portafolio.

Digimon y sus personajes pertenecen a sus respectivos propietarios.

Este proyecto no está afiliado oficialmente con Bandai, Toei Animation ni los propietarios de la franquicia.

La información se obtiene mediante Digi-API y otras fuentes públicas documentadas cuando corresponda.
