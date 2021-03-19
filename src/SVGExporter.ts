import { parseColorAndConvert, rgbToHex } from '@urpflanze/color'
import { ISceneChildPropArguments, Scene, ShapePrimitive, TSceneChildProp } from '@urpflanze/core'
import { ISVGExporterSettings, ISVGProps } from 'types'

class SVGExporter {
	static defaults: Required<ISVGExporterSettings> = {
		decimals: 3,
		background: true,
	}

	static parse(scene: Scene, settings: ISVGExporterSettings = {}): string {
		const bindedSettings: Required<ISVGExporterSettings> = {
			...SVGExporter.defaults,
			...settings,
		}

		return SVGExporter.generate(scene, bindedSettings)
	}

	/**
	 * Get drawer prop
	 *
	 * @param key name of the property (fill, stroke, lineWidth)
	 * @param propArguments currentIndexing propArguments
	 * @param defaultValue
	 *
	 * @returns string | number
	 */
	private static getSVGProp<T extends string | number>(
		key: keyof ISVGProps,
		propArguments: ISceneChildPropArguments,
		defaultValue?: T
	): T | undefined {
		let attribute = (propArguments.shape as ShapePrimitive<any, ISVGProps>).drawer[key] as TSceneChildProp<T>

		if (typeof attribute === 'function') {
			attribute = attribute(propArguments)
		}

		return attribute ?? defaultValue
	}

	/**
	 *
	 * @param type fill | stroke
	 * @param color string
	 * @param attriburesPtr list of attributes to apply
	 * @param stylePtr Array of string to put in style attr
	 *
	 * @returns
	 */
	public static bindColorAttribute(
		type: 'fill' | 'stroke',
		color: string | undefined,
		attriburesPtr: Array<string>,
		stylePtr: Array<string>
	): void {
		if (typeof color === 'undefined') return

		if (color === 'none') {
			attriburesPtr.push(`${type}="none"`)
		} else {
			const parsed = parseColorAndConvert(color)

			if (parsed) {
				if (parsed.alpha !== 1) {
					stylePtr.push(`${type}-opacity: ${parsed.alpha}`)
				}

				attriburesPtr.push(`${type}="${rgbToHex(parsed.r, parsed.g, parsed.b)}"`)
			}
		}
	}

	/**
	 * Generate SVG from scene and settings
	 *
	 * @param scene
	 * @param settings
	 * @returns
	 */
	private static generate(scene: Scene, settings: Required<ISVGExporterSettings>): string {
		const paths = SVGExporter.generatePaths(scene, settings)

		let background: string | undefined

		if (settings.background) {
			const attributes: Array<string> = []
			const styles: Array<string> = []

			SVGExporter.bindColorAttribute('fill', scene.background, attributes, styles)
			styles.length > 0 && attributes.push(`styles="${styles.join('; ')}"`)

			background = `<rect width="${scene.width}" height="${scene.height}" ${
				attributes.length ? attributes.join(' ') + ' ' : ''
			}/>`
		}

		return (
			`<svg viewBox="0 0 ${scene.width} ${scene.height}">` +
			`\n\t<!-- Create with Urpflanze <https://docs.urpflanze.org> -->` +
			(background ? `\n\t${background}` : '') +
			`\n\t${paths.join('\n')}` +
			`\n</svg>`
		)
	}

	/**
	 * Convert shapes to paths
	 *
	 * @param scene
	 * @param settings
	 * @returns
	 */
	private static generatePaths(scene: Scene, settings: Required<ISVGExporterSettings>): Array<string> {
		const paths: Array<string> = []

		const sceneChilds = scene.getChildren()
		for (let i = 0, len = sceneChilds.length; i < len; i++) {
			sceneChilds[i].generate(0, true)

			const childBuffer = sceneChilds[i].getBuffer() || []
			const childIndexedBuffer = sceneChilds[i].getIndexedBuffer() || []
			let childVertexIndex = 0

			for (
				let currentBufferIndex = 0, len = childIndexedBuffer.length;
				currentBufferIndex < len;
				currentBufferIndex++
			) {
				const currentIndexing = childIndexedBuffer[currentBufferIndex]

				// Store points
				const points = []
				for (let len = childVertexIndex + currentIndexing.frameLength; childVertexIndex < len; childVertexIndex += 2) {
					points.push(
						childBuffer[childVertexIndex].toFixed(settings.decimals) +
							' ' +
							childBuffer[childVertexIndex + 1].toFixed(settings.decimals)
					)
				}

				// get styles and bind attributes
				const propArguments: ISceneChildPropArguments = {
					shape: currentIndexing.shape,
					repetition: currentIndexing.repetition,
					parent: currentIndexing.parent,
				}

				const attributes: Array<string> = []
				const styles: Array<string> = []

				const fill = SVGExporter.getSVGProp<string>('fill', propArguments)
				SVGExporter.bindColorAttribute('fill', fill || 'none', attributes, styles)

				const stroke = SVGExporter.getSVGProp<string>(
					'stroke',
					propArguments,
					typeof fill === 'undefined' ? scene.color : undefined
				)
				SVGExporter.bindColorAttribute('stroke', stroke, attributes, styles)

				const lineWidth = SVGExporter.getSVGProp('lineWidth', propArguments, 1)
				if (stroke) attributes.push(`stroke-width="${lineWidth || 1}"`)

				// move style to attributes
				styles.length > 0 && attributes.push(`style="${styles.join('; ')}"`)

				// build path
				const d = `M${points.join(' L')} ${currentIndexing.shape.isClosed() ? 'Z' : ''}`
				const path = `<path d="${d}" ${attributes.length ? attributes.join(' ') + ' ' : ''}/>`

				paths.push(path)
			}
		}

		return paths
	}
}

export { SVGExporter }
