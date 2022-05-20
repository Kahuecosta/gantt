import { $ } from './svg_utils'

export default class Popup {
	constructor(gantt, parent, custom_html, container) {
		this.gantt = gantt
		this.parent = parent
		this.custom_html = custom_html
		this.container = container

		this.make()
	}

	make() {
		this.parent.innerHTML = `
            <div class="title"></div>
            <div class="tooltip-line responsable"></div>
						<div class="tooltip-line type"></div>
            <div class="tooltip-line period"></div>
						<div class="tooltip-line details"></div>
            <div class="pointer"></div>
        `

		this.hide()

		this.title = this.parent.querySelector('.title')
		this.responsable = this.parent.querySelector('.responsable')
		this.type = this.parent.querySelector('.type')
		this.period = this.parent.querySelector('.period')
		this.details = this.parent.querySelector('.details')
		this.pointer = this.parent.querySelector('.pointer')

		this.bind_events()
	}

	bind_events() {
		$.on(this.details, 'click', e => {
			if (e.target.className === 'link-detail') {
				const id = e.target.getAttribute('data-task-id')

				this.gantt.trigger_event('link_open_detail', [id])
			}
		})
	}

	show(options) {
		if (!options.target_element) {
			throw new Error('target_element is required to show popup')
		}

		if (!options.position) {
			options.position = 'left'
		}

		const target_element = options.target_element

		if (this.custom_html) {
			let html = this.custom_html(options.task)
			html += '<div class="pointer"></div>'
			this.parent.innerHTML = html
			this.pointer = this.parent.querySelector('.pointer')
		} else {
			// set data
			this.title.innerHTML = options.title

			this.set_type(options.task._type)

			this.set_period(options.period)

			this.set_responsable(options.task._responsable)

			this.set_link_detail(options.task.id, options.link_detail_text)

			this.parent.style.width = this.parent.clientWidth + 'px'
		}

		// set position
		let position_meta
		if (target_element instanceof HTMLElement) {
			position_meta = target_element.getBoundingClientRect()
		} else if (target_element instanceof SVGElement) {
			position_meta = options.target_element.getBBox()
		}

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

		// show
		this.parent.style.opacity = 1
		this.parent.style.zIndex = 0
	}

	set_period(period) {
		this.period.innerHTML = period
	}

	set_type(type = {}) {
		const { color, name, icon } = type

		if (name) {
			this.type.style.display = 'inherit'
		} else {
			this.type.style.display = 'none'

			return
		}

		let typeIcon = ''

		if (icon) {
			typeIcon = `<img class="popup-type-icon" src="${icon}" />`
		} else if (color) {
			typeIcon = `<span class="popup-type-icon" style="background-color:${color}"></span>`
		}

		this.type.innerHTML = `<span class="popup-type-name">${typeIcon}${name}</span>`
	}

	set_responsable(responsable = {}) {
		const { name, photo } = responsable

		if (name) {
			this.responsable.style.display = 'inherit'
		} else {
			this.responsable.style.display = 'none'

			return
		}

		const img = photo
			? `<img class="popup-responsable-icon" src="${photo}" />`
			: ''

		this.responsable.innerHTML = `<span class="popup-responsable-name">${img}${name}</span>`
	}

	set_link_detail(id, text) {
		this.details.innerHTML = `<span class="link-detail" data-task-id="${id}">${text}</span>`
	}

	hide() {
		this.parent.style.opacity = 0
		this.parent.style.left = 0
		this.parent.style.zIndex = -1
	}
}
