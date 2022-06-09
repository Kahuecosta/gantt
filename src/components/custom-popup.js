import { $ } from '../utilities/svg'

export default class CustomPopup {
	constructor(gantt, parent, container) {
		this.gantt = gantt
		this.parent = parent
		this.container = container
	}

	show(options) {
		if (!options.target_element) {
			throw new Error('target_element is required to show popup')
		}

		this.hide()

		const selector = `div[data-gantt-tooltip-id="${options.task.id}"]`

		this.tooltip = document.querySelector(selector)

		if (!this.tooltip) return

		let position_meta

		if (options.target_element instanceof HTMLElement) {
			position_meta = options.target_element.getBoundingClientRect()
		} else if (options.target_element instanceof SVGElement) {
			position_meta = options.target_element.getBBox()
		}

		options.position = options.position || 'left'

		if (options.position === 'left') {
			const left = position_meta.x + (position_meta.width + 10) + 'px'

			this.tooltip.style.left = left
		}

		const bottom = position_meta.y + this.tooltip.scrollHeight

		let top = position_meta.y

		if (bottom > this.container.scrollHeight) {
			top -= bottom - this.container.scrollHeight + 5
		}

		this.tooltip.style.top = `${top}px`
		this.tooltip.style.opacity = 1
		this.tooltip.style.zIndex = 0
	}

	hide() {
		const tooltips = [...this.parent.children]

		tooltips.forEach(item => {
			item.style.opacity = 0
			item.style.left = 0
			item.style.zIndex = -1
		})
	}
}
