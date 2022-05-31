import { createSVG } from '../utilities/svg'

export default class Arrow {
	constructor(gantt, from_task, to_task) {
		this.gantt = gantt
		this.from_task = from_task
		this.to_task = to_task

		this.calculate_path()
		this.draw()
	}

	calculate_path() {
		const { padding, bar_height, header_height } = this.gantt.options

		let start_x =
			this.from_task.$bar.getX() + this.from_task.$bar.getWidth() / 2

		const condition = () =>
			this.to_task.$bar.getX() < start_x + padding &&
			start_x > this.from_task.$bar.getX() + padding

		while (condition()) {
			start_x -= 10
		}

		const start_y =
			header_height +
			bar_height +
			(padding + bar_height) * this.from_task.task._index +
			padding
		const end_x = this.to_task.$bar.getX() - padding / 2
		const end_y =
			header_height +
			bar_height / 2 +
			(padding + bar_height) * this.to_task.task._index +
			padding
		const from_is_below_to =
			this.from_task.task._index > this.to_task.task._index
		const curve = this.gantt.options.arrow_curve
		const clockwise = from_is_below_to ? 1 : 0
		const curve_y = from_is_below_to ? -curve : curve
		const offset = from_is_below_to
			? end_y + this.gantt.options.arrow_curve
			: end_y - this.gantt.options.arrow_curve

		const M = `M ${start_x} ${start_y}`
		const V = `V ${offset}`
		const a = `a ${curve} ${curve} 0 0 ${clockwise} ${curve} ${curve_y}`
		const L = `L ${end_x} ${end_y}`
		const m = `m -5 -5`
		const l1 = `l 5 5`
		const l2 = `l -5 5`

		this.path = `${M}  ${V}  ${a}  ${L}  ${m} ${l1} ${l2}`

		if (this.to_task.$bar.getX() < this.from_task.$bar.getX() + padding) {
			const down_1 = padding / 2 - curve
			const down_2 =
				this.to_task.$bar.getY() + this.to_task.$bar.getHeight() / 2 - curve_y
			const left = this.to_task.$bar.getX() - padding

			const M = `M ${start_x} ${start_y}`
			const Mv = `v ${down_1}`
			const Ma = `a ${curve} ${curve} 0 0 1 -${curve} ${curve}`
			const H = `H ${left}`
			const Ha = `a ${curve} ${curve} 0 0 ${clockwise} -${curve} ${curve_y}`
			const V = `V ${down_2}`
			const Va = `a ${curve} ${curve} 0 0 ${clockwise} ${curve} ${curve_y}`
			const L = `L ${end_x} ${end_y}`
			const Lm = `m -5 -5`
			const Ll = `l 5 5`
			const Lll = `l -5 5`

			this.path = `${M} ${Mv} ${Ma} ${H} ${Ha}  ${V}  ${Va}  ${L}  ${Lm} ${Ll} ${Lll}`
		}
	}

	draw() {
		this.element = createSVG('path', {
			d: this.path,
			'data-from': this.from_task.task.id,
			'data-to': this.to_task.task.id,
		})
	}

	update() {
		this.calculate_path()
		this.element.setAttribute('d', this.path)
	}
}
