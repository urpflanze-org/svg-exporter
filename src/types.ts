import { IDrawerProps, TDrawerProp } from '@urpflanze/core'

export interface ISVGExporterSettings {
	decimals?: number
	background?: boolean
}

export interface ISVGProps extends IDrawerProps {
	fill?: TDrawerProp<string>
	stroke?: TDrawerProp<string>
	lineWidth?: TDrawerProp<number>
}
