import tap from 'tap'

import { Scene, Rect } from '@urpflanze/core'
import { SVGExporter } from '../src'

const scene = new Scene({
	width: 200,
	height: 200,
	background: '#fff',
	color: '#000',
})

scene.add(
	new Rect({
		sideLength: 50,
	})
)

scene.update(0)

tap.deepEqual(
	SVGExporter.parse(scene),
	'<svg viewBox="0 0 200 200">\n\t<!-- Create with Urpflanze <https://docs.urpflanze.org> -->\n\t<rect width="200" height="200" fill="#ffffff" />\n\t<path d="M50.000 50.000 L150.000 50.000 L150.000 150.000 L50.000 150.000 Z" fill="none" stroke="#000000" stroke-width="1" />\n</svg>',
	'default'
)

const scene2 = new Scene({
	width: 200,
	height: 200,
	background: '#fff',
	color: '#000',
})

scene2.add(
	new Rect({
		sideLength: () => 50,
		drawer: {
			stroke: 'rgba(255,0,0,.2)',
		},
	})
)

scene2.update(0)

tap.deepEqual(
	SVGExporter.parse(scene2),
	'<svg viewBox="0 0 200 200">\n\t<!-- Create with Urpflanze <https://docs.urpflanze.org> -->\n\t<rect width="200" height="200" fill="#ffffff" />\n\t<path d="M50.000 50.000 L150.000 50.000 L150.000 150.000 L50.000 150.000 Z" fill="none" stroke="#ff0000" stroke-width="1" style="stroke-opacity: 0.2" />\n</svg>',
	'stroke opacity'
)

const scene3 = new Scene({
	width: 200,
	height: 200,
	background: '#fff',
	color: '#000',
})

scene3.add(
	new Rect({
		sideLength: 50,
		drawer: {
			fill: 'rgba(255,0,0,.2)',
			stroke: 'hsla(180, 100%, 50%, .5)',
		},
	})
)

scene3.update(0)

tap.deepEqual(
	SVGExporter.parse(scene3, { background: false, decimals: 0 }),
	'<svg viewBox="0 0 200 200">\n\t<!-- Create with Urpflanze <https://docs.urpflanze.org> -->\n\t<path d="M50 50 L150 50 L150 150 L50 150 Z" fill="#ff0000" stroke="#00ffff" stroke-width="1" style="fill-opacity: 0.2; stroke-opacity: 0.5" />\n</svg>',
	'no background, 0 decimals'
)
