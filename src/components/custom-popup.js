import { $ } from '../utilities/svg'

export default class CustomPopup {
	constructor(gantt, parent, container) {
		this.gantt = gantt
		this.parent = parent
		this.container = container

		this.make()
	}

	loadTagPointer() {
		this.parent.innerHTML = '<div class="pointer"></div>'

		this.pointer = this.parent.querySelector('.pointer')
	}

	make() {
		this.loadTagPointer()

		this.hide()

		this.bind_events()
	}

	bind_events() {
		if (this.gantt.options.workitems_click_tooltip_open_detail) {
			$.on(this.parent, 'click', e => {
				const id = e.target.getAttribute('data-task-id')

				this.gantt.trigger_event('link_open_detail', [id])
			})
		}
	}

	show(options) {
		if (!options.target_element) {
			throw new Error('target_element is required to show popup')
		}

		this.loadTagPointer()

		const selector = `div[data-gantt-tooltip-id="${options.task.id}"]`
		const html = document.querySelector(selector)

		if (!html) return

		this.parent.innerHTML += html.innerHTML

		if (this.gantt.options.workitems_click_tooltip_open_detail) {
			this.parent.classList.add('open-detail')
			this.parent.setAttribute('data-task-id', options.task.id)
		}

		let position_meta

		if (options.target_element instanceof HTMLElement) {
			position_meta = options.target_element.getBoundingClientRect()
		} else if (options.target_element instanceof SVGElement) {
			position_meta = options.target_element.getBBox()
		}

		options.position = options.position || 'left'

		if (options.position === 'left') {
			const left = position_meta.x + (position_meta.width + 10) + 'px'

			this.parent.style.left = left
			this.pointer.style.transform = 'rotateZ(90deg)'
			this.pointer.style.left = '-7px'
			this.pointer.style.top = '2px'
		}

		const bottom = position_meta.y + this.parent.scrollHeight

		let top = position_meta.y

		if (bottom > this.container.scrollHeight) {
			top -= bottom - this.container.scrollHeight + 5

			this.pointer.style.top = `${bottom - this.container.scrollHeight + 7}px`
		}

		this.parent.style.top = `${top}px`
		this.parent.style.opacity = 1
		this.parent.style.zIndex = 0
	}

	hide() {
		this.parent.style.opacity = 0
		this.parent.style.left = 0
		this.parent.style.zIndex = -1
	}
}
