# Scripts

* **`yarn start`** for running a development version
* **`yarn build`** to build the static version in `./dist` 

# Installation

Install parcel and react (https://parceljs.org/recipes/react):

```shell
yarn add --dev parcel
yarn add react react-dom @vechain/connex antd
yarn add --dev @types/react @types/react-dom ts-standard typescript
yarn add @tanstack/react-query
```

Add shortcuts in `package.json`:

```json
  "scripts": {
    "build": "parcel build src/index.html",
    "start": "parcel serve src/index.html"
  }
```
