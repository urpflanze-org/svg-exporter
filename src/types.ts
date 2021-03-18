import { TSceneChildProp } from '@urpflanze/core'

export interface ISVGExporterSettings {
	decimals?: number
	background?: boolean
}

export interface ISVGProps {
	fill?: TSceneChildProp<string>
	stroke?: TSceneChildProp<string>
	lineWidth?: TSceneChildProp<number>
}
