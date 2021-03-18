# SVG-Exporter

This is a tool to export the [urpflanze scene](https://github.com/urpflanze-org/core) to SVG

Install with npm

```shell
npm i -S @urpflanze/svg-exporter
```

Import GCODEExporter:

```javascript
import { Scene } from '@urpflanze/core'
import { SVGExporter } from '@urpflanze/svg-exporter'
// or const { SVGExporter } = require('@urpflanze/svg-exporter')

const scene = new Urpflanze.Scene()

// creating a scene

scene.update()

const svg = SVGExporter.parse(scene /*, config*/)
```

Possible config:

- `decimals` _number_ default _3_
- `background` _boolean_ default _true_
