import date_utils from './utilities/date'
import { $, createSVG } from './utilities/svg'
import Bar from './components/bar'
import Arrow from './components/arrow'
import Popup from './components/popup'
import './assets/gantt.scss'
import {
	VIEW_MODE,
	RESPONSABLE_DEFAULT_ID,
	DATA_OPEN,
	DATA_TYPE,
	DATA_ATTR,
} from './constants'
import GanttUtilities from './utilities/gantt'

export default class Gantt {
	constructor(
		wrapper,
		workItems,
		workItemTypes,
		responsables = [],
		groups = [],
		options
	) {
		this.utilities = new GanttUtilities()

		this.VIEW_MODE = VIEW_MODE

		this.step = 24
		this.column_width = 38

		const optionsCopy = JSON.parse(JSON.stringify(options))
		const responsablesCopy = JSON.parse(JSON.stringify(responsables))
		const groupsCopy = JSON.parse(JSON.stringify(groups))
		const workItemTypesCopy = JSON.parse(JSON.stringify(workItemTypes))
		const workItemsCopy = JSON.parse(JSON.stringify(workItems))

		this.setup_wrapper(wrapper)
		this.setup_options(optionsCopy)
		this.setup_responsables(responsablesCopy)
		this.setup_groups(groupsCopy)
		this.setup_workItem_types(workItemTypesCopy)
		this.setup_tasks(workItemsCopy)

		// initialize with default view mode
		this.change_view_mode()
		this.bind_events()
	}

	setup_wrapper(element) {
		let svg_element, wrapper_element

		// CSS Selector is passed
		if (typeof element === 'string') {
			element = document.querySelector(element)
		}

		// get the SVGElement
		if (element instanceof HTMLElement) {
			wrapper_element = element
			svg_element = element.querySelector('svg')
		} else if (element instanceof SVGElement) {
			svg_element = element
		} else {
			throw new TypeError(
				'Frappé Gantt only supports usage of a string CSS selector,' +
					" HTML DOM element or SVG DOM element for the 'element' parameter"
			)
		}

		// svg element
		if (!svg_element) {
			// create it
			this.$svg = createSVG('svg', {
				append_to: wrapper_element,
				class: 'gantt-svg',
			})
		} else {
			this.$svg = svg_element
			this.$svg.classList.add('gantt-svg')
		}

		// wrapper element
		this.$container = document.createElement('div')
		this.$container.classList.add('gantt-container')

		const parent_element = this.$svg.parentElement
		parent_element.appendChild(this.$container)
		this.$container.appendChild(this.$svg)

		// popup wrapper
		this.popup_wrapper = document.createElement('div')
		this.popup_wrapper.classList.add('popup-wrapper')
		this.$container.appendChild(this.popup_wrapper)
	}

	setup_options(options) {
		const default_options = {
			header_height: 50,
			view_modes: [...Object.values(VIEW_MODE)],
			bar_height: 20,
			bar_corner_radius: 3,
			arrow_curve: 5,
			padding: 18,
			view_mode: 'Day',
			date_format: 'YYYY-MM-DD',
			popup_trigger: 'click',
			custom_popup_html: null,
			language: 'en',
			margin_bottom: 100,
			disallow_popup: false,
			readonly: false,
			draggable_bar_handles: true,
			hasArrows: true,
			move_dependent: 'left',
			padding_start: null,
			padding_end: null,
			fixed_label_location: false,
			hide_labels: false,
			horizontal_auto_scroll_labels: false,
			draggable_bar: true,
			handle_bar_color: '#752f00',
			handle_progress_color: '#752f00',
			resource_resize_enable: true,
			resource_fixed: false,
			resource_enable: false,
			resource_collapse_enable: false,
			resource_title: 'Tasks',
			resource_width: 250,
			responsables_enable: false,
			responsables_sort_by: 'name',
			responsables_default_name: 'Não atribuido',
			groups_enable: false,
			groups_sort_by: 'name',
			workitems_sort_by: 'name',
			rows_alternate_background: true,
			grid_ticks: true,
			bar_color_default: '#FFCC33',
			highlights_weekend: true,
			highlights_past_days: true,
			link_detail_text: 'Ver detalhes',
			dir_assets: '../dist/assets',
		}

		default_options.responsables_default_photo = `${default_options.dir_assets}/responsable-default.png`

		this.options = Object.assign({}, default_options, options)
	}

	setup_groups(groups) {
		if (this.options.groups_enable) {
			this.groups = groups

			this.sort_groups()
		} else {
			this.groups = []
		}
	}

	setup_responsables(responsables) {
		if (this.options.responsables_enable) {
			this.responsables = responsables

			this.sort_responsables()

			this.responsables.push({
				id: RESPONSABLE_DEFAULT_ID,
				name: this.options.responsables_default_name,
				photo: this.options.responsables_default_photo,
			})
		} else {
			this.responsables = []
		}
	}

	setup_workItem_types(workItemTypes) {
		// convert workItemTypes array to a dictionary for faster lookups
		this.workItemTypes = workItemTypes.reduce((dict, curr) => {
			dict[curr.id] = curr

			return dict
		}, {})
	}

	sort_responsables() {
		const { responsables_sort_by } = this.options

		this.responsables = this.responsables.sort((a, b) => {
			if (a[responsables_sort_by] > b[responsables_sort_by]) return 1

			if (a[responsables_sort_by] < b[responsables_sort_by]) return -1

			return 0
		})
	}

	sort_groups() {
		const { groups_sort_by } = this.options

		this.groups = this.groups.sort((a, b) => {
			if (a[groups_sort_by] > b[groups_sort_by]) return 1

			if (a[groups_sort_by] < b[groups_sort_by]) return -1

			return 0
		})
	}

	sort_tasks(tasks) {
		const { workitems_sort_by } = this.options

		return tasks.sort((a, b) => {
			if (a[workitems_sort_by] > b[workitems_sort_by]) return 1

			if (a[workitems_sort_by] < b[workitems_sort_by]) return -1

			return 0
		})
	}

	sort_tasks_by_responsable(tasks) {
		if (!this.options.responsables_enable) {
			return this.sort_tasks(tasks)
		}

		let ordened_tasks = []

		this.responsables.forEach(item => {
			let list_tasks = tasks.filter(task => task.responsable_id === item.id)

			list_tasks = this.sort_tasks(list_tasks)

			ordened_tasks = [...ordened_tasks, ...list_tasks]
		})

		return ordened_tasks
	}

	sort_tasks_by_groups(tasks) {
		if (!this.options.groups_enable) {
			return this.sort_tasks(tasks)
		}

		let ordened_tasks = []

		this.groups.forEach(group => {
			let list_tasks = tasks.filter(task => task.group_id === group.id)

			list_tasks = this.sort_tasks(list_tasks)

			ordened_tasks = [...ordened_tasks, ...list_tasks]
		})

		return ordened_tasks
	}

	set_task_index_by_responsable() {
		let index = 0

		this.resource_tree.forEach(item => {
			if (item.type === 'responsable') {
				index++
			} else {
				const task = this.get_task(item.task_id)

				task._index = index

				index++
			}
		})
	}

	set_task_index_by_groups() {
		let index = 0

		this.resource_tree.forEach(item => {
			if (item.type === 'groups' || item.type === 'sub_group') {
				index++
			} else {
				const task = this.get_task(item.task_id)

				task._index = index

				index++
			}
		})
	}

	resource_tree_group_push_task(group, sub_group) {
		let tasks = [...this.tasks]

		if (group) {
			tasks = tasks.filter(task => task.group_id === group.id)
		}

		if (sub_group) {
			tasks = tasks.filter(task => task.sub_group_id === sub_group.id)
		}

		tasks.forEach(task => {
			this.resource_tree.push({
				type: 'task',
				task_id: task.id,
				group_id: group.id,
				sub_group_id: sub_group ? sub_group.id : null,
			})
		})
	}

	set_resource_tree() {
		const { responsables_enable, groups_enable } = this.options

		this.resource_tree = []

		if (!responsables_enable && !groups_enable) {
			this.resource_tree = this.tasks.map(task => ({
				type: 'task',
				task_id: task.id,
			}))

			return
		}

		if (groups_enable) {
			this.groups.forEach(group => {
				this.resource_tree.push({
					type: 'groups',
					group_id: group.id,
					group_name: group.name,
					group_icon: group.icon,
					color: group.color,
				})

				if (group.sub_group) {
					group.sub_group.forEach(sg => {
						this.resource_tree.push({
							type: 'sub_group',
							sub_group_id: sg.id,
							sub_group_name: sg.name,
							sub_group_icon: sg.icon,
							color: sg.color,
							group_id: group.id,
						})

						this.resource_tree_group_push_task(group, sg)
					})
				} else {
					group.sub_group = []

					this.resource_tree_group_push_task(group)
				}
			})

			return
		}

		this.responsables.forEach(responsable => {
			this.resource_tree.push({
				type: 'responsable',
				responsable_id: responsable.id,
				responsable_name: responsable.name,
				responsable_photo: responsable.photo,
			})

			this.tasks
				.filter(task => task.responsable_id === responsable.id)
				.forEach(task => {
					this.resource_tree.push({
						type: 'task',
						task_id: task.id,
						responsable_id: responsable.id,
					})
				})
		})
	}

	setup_tasks(tasks) {
		this.task_map = {}

		// prepare tasks
		const tasks_map = tasks.map((task, i) => {
			// convert to Date objects
			task._start = date_utils.parse(task.start)
			task._end = date_utils.parse(task.end)

			// make task invalid if duration too large
			if (date_utils.diff(task._end, task._start, 'year') > 10) {
				task.end = null
			}

			// cache index
			task._index = i

			// invalid dates
			if (!task.start && !task.end) {
				const today = date_utils.today()
				task._start = today
				task._end = date_utils.add(today, 2, 'day')
			}

			if (!task.start && task.end) {
				task._start = date_utils.add(task._end, -2, 'day')
			}

			if (task.start && !task.end && task.duration) {
				task._end = date_utils.add(task._start, task.duration, 'day')
			} else if (task.start && !task.end) {
				task._end = date_utils.add(task._start, 2, 'day')
			}

			// if hours is not set, assume the last day is full day
			// e.g: 2018-09-09 becomes 2018-09-09 23:59:59
			const task_end_values = date_utils.get_date_values(task._end)

			if (task_end_values.slice(3).every(d => d === 0)) {
				task._end = date_utils.add(task._end, 24, 'hour')
			}

			// invalid flag
			if (!task.start || (!task.end && !task.duration)) {
				task.invalid = true
			}

			// dependencies
			if (typeof task.dependencies === 'string' || !task.dependencies) {
				let deps = []

				if (task.dependencies) {
					deps = task.dependencies
						.split(',')
						.map(d => d.trim())
						.filter(d => d)
				}

				task.dependencies = deps
			}

			// uids
			if (!task.id) {
				throw new TypeError('The task id is invalid!')
			}

			// workItem types
			if (
				typeof task.type_id !== 'undefined' &&
				this.workItemTypes.hasOwnProperty(task.type_id)
			) {
				task._type = this.workItemTypes[task.type_id]
			}

			// workItem responsable
			if (
				typeof task.responsable_id !== 'undefined' &&
				this.responsables.hasOwnProperty(task.responsable_id)
			) {
				task._responsable = this.responsables.find(
					item => item.id === task.responsable_id
				)
			}

			if (!task._responsable) {
				task.responsable_id = RESPONSABLE_DEFAULT_ID
				task._responsable = this.responsables[this.responsables.length - 1]
			}

			// workItem groups
			if (
				typeof task.group_id !== 'undefined' &&
				this.groups.hasOwnProperty(task.group_id)
			) {
				task._group = this.groups.find(item => item.id === task.group_id)
			}

			this.task_map[task.id] = task

			return task
		})

		if (this.options.groups_enable) {
			this.tasks = this.sort_tasks_by_groups(tasks_map)
		} else {
			this.tasks = this.sort_tasks_by_responsable(tasks_map)
		}

		this.set_resource_tree()

		if (this.options.groups_enable) {
			this.set_task_index_by_groups()
		} else {
			this.set_task_index_by_responsable()
		}

		this.setup_dependencies()
	}

	setup_dependencies() {
		this.dependency_map = {}

		for (let t of this.tasks) {
			for (let d of t.dependencies) {
				this.dependency_map[d] = this.dependency_map[d] || []
				this.dependency_map[d].push(t.id)
			}
		}
	}

	refresh(tasks) {
		this.setup_tasks(tasks)
		this.change_view_mode()
	}

	change_view_mode(mode = this.options.view_mode) {
		this.update_view_scale(mode)
		this.setup_dates()
		this.render()
		this.trigger_event('view_change', [mode])
	}

	update_view_scale(view_mode) {
		this.options.view_mode = view_mode

		if (view_mode === VIEW_MODE.HOUR) {
			this.step = 24 / 24
			this.column_width = 50
		} else if (view_mode === VIEW_MODE.DAY) {
			this.step = 24
			this.column_width = 100
		} else if (view_mode === VIEW_MODE.HALF_DAY) {
			this.step = 24 / 2
			this.column_width = 100
		} else if (view_mode === VIEW_MODE.QUARTER_DAY) {
			this.step = 24 / 4
			this.column_width = 100
		} else if (view_mode === VIEW_MODE.WEEK) {
			this.step = 24 * 7
			this.column_width = 200
		} else if (view_mode === VIEW_MODE.MONTH) {
			this.step = 24 * 30
			this.column_width = 300
		} else if (view_mode === VIEW_MODE.YEAR) {
			this.step = 24 * 365
			this.column_width = 400
		}
	}

	setup_dates() {
		this.setup_gantt_dates()
		this.setup_date_values()
	}

	setup_gantt_dates() {
		this.gantt_start = this.gantt_end = null

		for (let task of this.tasks) {
			if (!this.gantt_start || task._start < this.gantt_start) {
				this.gantt_start = task._start
			}

			if (!this.gantt_end || task._end > this.gantt_end) {
				this.gantt_end = task._end
			}
		}

		if (!this.tasks.length) {
			this.gantt_start = this.gantt_end = new Date()
		}

		this.gantt_start = date_utils.start_of(this.gantt_start, 'day')
		this.gantt_end = date_utils.start_of(this.gantt_end, 'day')

		const padd_start = this.options.padding_start || this.default_padding()
		const padd_end = this.options.padding_end || this.default_padding()

		const { HOUR, QUARTER_DAY, HALF_DAY, DAY, WEEK, MONTH, YEAR } = VIEW_MODE

		if (this.view_is([HOUR, QUARTER_DAY, HALF_DAY, DAY])) {
			this.gantt_start = date_utils.add(this.gantt_start, -padd_start, 'day')

			this.gantt_end = date_utils.add(this.gantt_end, padd_end, 'day')
		} else if (this.view_is(WEEK)) {
			this.gantt_start = date_utils.add(
				this.gantt_start,
				-(padd_start * 7),
				'day'
			)

			this.gantt_end = date_utils.add(this.gantt_end, padd_end * 7, 'day')
		} else if (this.view_is(MONTH)) {
			this.gantt_start = date_utils.add(this.gantt_start, -padd_start, 'month')

			this.gantt_end = date_utils.add(this.gantt_end, padd_end, 'month')
		} else if (this.view_is(YEAR)) {
			this.gantt_start = date_utils.add(this.gantt_start, -padd_start, 'year')

			this.gantt_end = date_utils.add(this.gantt_end, padd_end, 'year')
		}
	}

	default_padding() {
		const { QUARTER_DAY, HALF_DAY, DAY, WEEK, MONTH, YEAR } = VIEW_MODE

		if (this.view_is([QUARTER_DAY, HALF_DAY, DAY])) {
			return 14
		} else if (this.view_is(WEEK)) {
			return 5
		} else if (this.view_is(MONTH)) {
			return 6
		} else if (this.view_is(YEAR)) {
			return 3
		} else {
			return 6
		}
	}

	setup_date_values() {
		this.dates = []
		let cur_date = null

		while (cur_date === null || cur_date < this.gantt_end) {
			if (!cur_date) {
				cur_date = date_utils.clone(this.gantt_start)
			} else {
				if (this.view_is(VIEW_MODE.YEAR)) {
					cur_date = date_utils.add(cur_date, 1, 'year')
				} else if (this.view_is(VIEW_MODE.MONTH)) {
					cur_date = date_utils.add(cur_date, 1, 'month')
				} else {
					cur_date = date_utils.add(cur_date, this.step, 'hour')
				}
			}

			this.dates.push(cur_date)
		}
	}

	bind_events() {
		this.bind_grid_events()
		this.bind_bar_events()
		this.bind_resource_events()
	}

	render() {
		this.clear()
		this.setup_layers()
		this.make_resource()
		this.make_grid()
		this.make_dates()
		this.make_bars()
		this.make_arrows()
		this.map_arrows_on_bars()
		this.set_width()
		this.set_scroll_position()
	}

	setup_layers() {
		this.layers = {}

		const layers = [
			'grid',
			'arrow',
			'progress',
			'bar',
			'details',
			'date',
			'resource_bg',
			'resource',
			'resource_title',
		]

		for (let layer of layers) {
			this.layers[layer] = createSVG('g', {
				class: layer,
				append_to: this.$svg,
			})
		}
	}

	make_resource() {
		const {
			resource_enable,
			resource_width,
			resource_title,
			resource_resize_enable,
			header_height,
			padding,
		} = this.options

		this.resource_width = 0

		if (!resource_enable) return

		const row_width = resource_width
		const row_height = this.get_rows_height()

		this.resource_grid_layer = []
		this.resource_line_grid_layer = []
		this.resource_item_title_list = []
		this.resource_width = resource_width

		const grid_layer = createSVG('g', { append_to: this.layers.resource })
		const text_layer = createSVG('g', { append_to: this.layers.resource })
		const lines_layer = createSVG('g', { append_to: this.layers.resource })

		let row_y = header_height + padding / 2

		this.resource_background_clip = createSVG('clipPath', {
			id: 'clip-resource-background',
			append_to: this.layers.resource,
		})

		this.resource_background_r_clip = createSVG('rect', {
			x: 1,
			y: 1,
			width: row_width,
			height: '100%',
			class: 'resource-background',
			append_to: this.resource_background_clip,
		})

		this.resource_background = createSVG('rect', {
			x: 1,
			y: 1,
			width: row_width,
			height: '100%',
			class: 'resource-background',
			append_to: this.layers.resource_bg,
		})

		this.resource_header = createSVG('g', {
			append_to: this.layers.resource_title,
		})

		this.resource_header_row = createSVG('rect', {
			x: 0,
			y: 0,
			width: row_width,
			height: row_height + header_height - 32,
			class: 'resource-header-row',
			append_to: this.resource_header,
		})

		this.resource_header_line = createSVG('rect', {
			x: 0,
			y: row_height + header_height - 30,
			width: row_width,
			height: 1,
			class: 'resource-header-line',
			append_to: this.resource_header,
		})

		this.resource_header_text = createSVG('text', {
			x: 20,
			y: row_y - 20,
			width: row_width,
			height: row_height,
			innerHTML: resource_title,
			class: 'resource-header-text',
			append_to: this.resource_header,
			clipPath: 'clip-resource-background',
		})

		this.resource_line = createSVG('rect', {
			x: row_width,
			y: 0,
			width: 1,
			height: '100%',
			class: `resource-line ${resource_resize_enable ? 'resource-resize' : ''}`,
			append_to: this.resource_header,
		})

		this.resource_tree.forEach(tree => {
			let item

			if (tree.type === 'groups') {
				item = {
					name: tree.group_name,
					icon: tree.group_icon,
					color: tree.color,
					group_id: tree.group_id,
					is_group: true,
				}
			} else if (tree.type === 'sub_group') {
				item = {
					name: tree.sub_group_name,
					icon: tree.sub_group_icon,
					color: tree.color,
					sub_group_id: tree.sub_group_id,
					group_id: tree.group_id,
					is_sub_group: true,
				}
			} else if (tree.type === 'responsable') {
				item = {
					name: tree.responsable_name,
					photo: tree.responsable_photo,
					responsable_id: tree.responsable_id,
					is_responsable: true,
				}
			} else {
				item = this.get_task(tree.task_id)
			}

			const resource_text_item = createSVG('g', {
				append_to: text_layer,
				class: 'resource-text-item',
			})

			this.make_resource_text(
				item,
				row_y,
				row_width,
				row_height,
				resource_text_item
			)

			const task_grid_layer = createSVG('rect', {
				x: 0,
				y: row_y,
				width: row_width,
				height: row_height,
				append_to: grid_layer,
			})

			const line_grid_layer = createSVG('line', {
				x1: 0,
				y1: row_y + row_height,
				x2: row_width,
				y2: row_y + row_height,
				class: 'row-line',
				append_to: lines_layer,
			})

			this.resource_grid_layer.push(task_grid_layer)
			this.resource_line_grid_layer.push(line_grid_layer)

			row_y += this.get_rows_height()
		})
	}

	make_resource_text(item, row_y, row_width, row_height, el_parent) {
		const { responsables_enable, groups_enable, resource_collapse_enable } =
			this.options

		let elY = row_y + row_height / 2 + 2
		let elX = 10
		let padding = 30
		let item_title_css = 'resource-text '

		el_parent.setAttribute(DATA_ATTR.OPEN, DATA_OPEN.OPEN)

		if (groups_enable && item.is_group) {
			if (resource_collapse_enable) {
				this.make_resource_icon_color(item, el_parent, elY - 14, 18, 25)

				this.make_resource_arrow(item, el_parent, elY, 3, 12)

				elX += 10
				padding += 14
			} else {
				this.make_resource_icon_color(item, el_parent, elY - 14, 10, 25)
			}

			if (item.icon || item.color) {
				elX += 30
				padding += 22
			}

			elY += 3
			item_title_css += '-group'

			el_parent.setAttribute(DATA_ATTR.TYPE, DATA_TYPE.GROUP)
		} else if (groups_enable && item.is_sub_group) {
			if (resource_collapse_enable) {
				this.make_resource_icon_color(item, el_parent, elY - 10, 30, 18)

				this.make_resource_arrow(item, el_parent, elY, 14, 12)

				elX += 16
				padding += 18
			} else {
				this.make_resource_icon_color(item, el_parent, elY - 10, 18, 18)
			}

			if (item.icon || item.color) {
				elX += 30
				padding += 22
			} else {
				elX += 4
			}

			elY += 3
			item_title_css += '-sub-group'

			el_parent.setAttribute(DATA_ATTR.TYPE, DATA_TYPE.SUB_GROUP)
			el_parent.setAttribute(DATA_ATTR.TYPE_PARENT, DATA_TYPE.GROUP)
		} else if (responsables_enable && item.is_responsable) {
			this.make_resource_responsable_photo(
				item.photo,
				el_parent,
				elY - 14,
				8,
				25
			)

			elX += 30
			elY += 3
			padding += 22
			item_title_css += '-responsable'

			el_parent.setAttribute(DATA_ATTR.TYPE, DATA_TYPE.RESPONSABLE)
		} else {
			item_title_css += '-task'

			if (responsables_enable || groups_enable) {
				elX += 20
				padding += 20
			}

			if (groups_enable && responsables_enable) {
				this.make_resource_responsable_photo(
					item._responsable.photo,
					el_parent,
					elY - 14,
					30,
					21
				)

				elY += 2
				elX += 26
				padding += 25
			}

			const type = this.workItemTypes[item.type_id]

			if (type) {
				this.make_resource_workitem_type(type, el_parent, elY - 12, elX, 14)

				elX += 20
				padding += 20
			}

			el_parent.setAttribute(DATA_ATTR.TYPE, DATA_TYPE.WORKITEM)
			el_parent.setAttribute(DATA_ATTR.ID, item.id)

			if (item.group_id && item.sub_group_id) {
				el_parent.setAttribute(DATA_ATTR.TYPE_PARENT, DATA_TYPE.SUB_GROUP)
			} else {
				el_parent.setAttribute(DATA_ATTR.TYPE_PARENT, DATA_TYPE.GROUP)
			}
		}

		const item_title = createSVG('text', {
			x: elX,
			y: elY,
			[DATA_ATTR.ID]: item.id || '',
			[DATA_ATTR.GROUP_ID]: item.group_id || '',
			[DATA_ATTR.SUB_GROUP_ID]: item.sub_group_id || '',
			class: item_title_css,
			append_to: el_parent,
			clipPath: 'clip-resource-background',
		})

		this.resource_item_title_list.push({
			element: item_title,
			row_width,
			padding,
			name: item.name,
		})

		this.utilities.text_ellipsis(item_title, item.name, row_width - padding)
	}

	make_resource_responsable_photo(photo, el_parent, elY, elX, img_wh) {
		if (!photo) return

		createSVG('foreignObject', {
			x: elX,
			y: elY,
			width: img_wh,
			height: img_wh,
			append_to: el_parent,
			innerHTML: this.utilities.html_avatar(photo, img_wh, img_wh),
		})
	}

	make_resource_icon_color(item, el_parent, elY, elX, img_wh) {
		if (item.icon) {
			createSVG('foreignObject', {
				x: elX,
				y: elY,
				width: img_wh,
				height: img_wh,
				append_to: el_parent,
				[DATA_ATTR.ID]: item.id || '',
				[DATA_ATTR.GROUP_ID]: item.group_id || '',
				[DATA_ATTR.SUB_GROUP_ID]: item.sub_group_id || '',
				class: this.options.resource_collapse_enable ? 'resource-pointer' : '',
				innerHTML: this.utilities.html_avatar(item.icon, img_wh, img_wh),
			})
		} else if (item.color) {
			createSVG('rect', {
				x: elX,
				y: elY,
				rx: img_wh,
				ry: img_wh,
				width: img_wh,
				height: img_wh,
				[DATA_ATTR.ID]: item.id || '',
				[DATA_ATTR.GROUP_ID]: item.group_id || '',
				[DATA_ATTR.SUB_GROUP_ID]: item.sub_group_id || '',
				style: `fill:${item.color || '#000000'}`,
				class: this.options.resource_collapse_enable ? 'resource-pointer' : '',
				append_to: el_parent,
			})
		}
	}

	make_resource_arrow(item, el_parent, elY, elX, img_wh) {
		if (!this.options.resource_collapse_enable) return

		createSVG('image', {
			x: elX,
			y: elY - 7,
			width: img_wh,
			height: img_wh,
			append_to: el_parent,
			[DATA_ATTR.ID]: item.id || '',
			[DATA_ATTR.GROUP_ID]: item.group_id || '',
			[DATA_ATTR.SUB_GROUP_ID]: item.sub_group_id || '',
			class: 'resource-pointer resource-arrow',
			href: `${this.options.dir_assets}/angle-down-solid.svg`,
		})
	}

	make_resource_workitem_type(type, el_parent, elY, elX, img_wh) {
		if (type.icon) {
			createSVG('image', {
				x: elX,
				y: elY,
				width: img_wh,
				height: img_wh,
				class: 'resource-type-icon-img',
				href: type.icon,
				clipPath: 'clip_' + type.id,
				append_to: el_parent,
			})
		} else if (type.color) {
			createSVG('rect', {
				x: elX,
				y: elY,
				rx: img_wh,
				ry: img_wh,
				width: img_wh,
				height: img_wh,
				class: 'resource-type-icon',
				style: `fill:${type.color || '#000000'}`,
				append_to: el_parent,
			})
		}
	}

	make_grid() {
		this.make_grid_background()
		this.make_grid_header()
		this.make_grid_highlights()
		this.make_grid_rows()
		this.make_grid_ticks()
	}

	make_grid_background() {
		const grid_width =
			this.resource_width + this.dates.length * this.column_width

		const bar_height_padding = this.get_rows_height()

		const grid_height =
			this.options.header_height +
			this.options.padding +
			bar_height_padding * this.resource_tree.length

		createSVG('rect', {
			x: 0,
			y: 0,
			width: grid_width,
			height: grid_height,
			class: 'grid-background',
			append_to: this.layers.grid,
		})

		const space_height = this.options.padding + this.options.margin_bottom

		$.attr(this.$svg, {
			height: grid_height + space_height,
			width: grid_width,
		})
	}

	make_grid_rows() {
		const { header_height, bar_height, padding, rows_alternate_background } =
			this.options

		const rows_layer = createSVG('g', { append_to: this.layers.grid })
		const lines_layer = createSVG('g', { append_to: this.layers.grid })

		const row_width =
			this.resource_width + this.dates.length * this.column_width

		const row_height = bar_height + padding

		const total_rows = this.resource_tree.length

		let row_y = header_height + padding / 2

		const grid_row_class = rows_alternate_background
			? 'grid-row -alt-bg'
			: 'grid-row'

		for (let i = 0; i < total_rows; i++) {
			createSVG('rect', {
				x: 0,
				y: row_y,
				width: row_width,
				height: row_height,
				class: grid_row_class,
				append_to: rows_layer,
			})

			createSVG('line', {
				x1: 0,
				y1: row_y + row_height,
				x2: row_width,
				y2: row_y + row_height,
				class: 'row-line',
				append_to: lines_layer,
			})

			row_y += row_height
		}
	}

	make_grid_header() {
		const header_width =
			this.resource_width + this.dates.length * this.column_width

		const header_height = this.options.header_height + 10

		createSVG('rect', {
			x: 0,
			y: 0,
			width: header_width,
			height: header_height,
			class: 'grid-header',
			append_to: this.layers.date,
		})
	}

	make_grid_ticks() {
		if (!this.options.grid_ticks) return

		let tick_x = this.resource_width
		let tick_y = this.options.header_height + this.options.padding / 2
		let tick_height = this.get_rows_height() * this.resource_tree.length

		this.grid_ticks = []

		const grid_ticks_g = createSVG('g', { append_to: this.layers.grid })

		for (let date of this.dates) {
			let width = 0.2

			if (this.view_is(VIEW_MODE.DAY) && date.getDate() === 1) {
				width = 0.4
			}

			if (
				this.view_is(VIEW_MODE.WEEK) &&
				date.getDate() >= 1 &&
				date.getDate() < 8
			) {
				width = 0.4
			}

			if (this.view_is(VIEW_MODE.MONTH) && (date.getMonth() + 1) % 3 === 0) {
				width = 0.4
			}

			const grid_tick = createSVG('rect', {
				x: tick_x,
				y: tick_y,
				height: tick_height,
				width: width,
				class: 'tick',
				append_to: grid_ticks_g,
			})

			this.grid_ticks.push(grid_tick)

			if (this.view_is(VIEW_MODE.MONTH)) {
				tick_x += (date_utils.get_days_in_month(date) * this.column_width) / 30
			} else {
				tick_x += this.column_width
			}
		}
	}

	make_grid_highlights() {
		if (!this.view_is(VIEW_MODE.DAY)) return

		const {
			padding,
			header_height,
			bar_height,
			highlights_weekend,
			highlights_past_days,
		} = this.options

		let resource_width = 0

		if (this.options.resource_enable) {
			resource_width = this.options.resource_width
		}

		const today = date_utils.today()
		const diff = date_utils.diff(today, this.gantt_start, 'hour')
		const column_start = (diff / this.step) * this.column_width + resource_width
		const x = column_start + this.column_width / 2 - 1

		const height =
			(bar_height + padding) * this.resource_tree.length +
			header_height +
			padding / 2

		this.today_highlight_line_1 = createSVG('rect', {
			x,
			y: header_height + 8,
			height: height - header_height,
			width: 2,
			class: 'today-highlight -col',
			append_to: this.layers.date,
		})

		this.today_highlight_line_2 = createSVG('rect', {
			x: column_start,
			y: header_height + 8,
			height: 2,
			width: this.column_width,
			class: 'today-highlight',
			append_to: this.layers.date,
		})

		if (highlights_past_days) {
			this.make_grid_highlights_past_days(this.column_width, resource_width)
		}

		if (highlights_weekend) {
			this.make_grid_highlights_weekend(this.column_width, resource_width)
		}
	}

	make_grid_highlights_weekend(column_width, resource_width) {
		const start = this.gantt_start
		const end = this.gantt_end
		const total = date_utils.diff(end, start, 'day')
		let now = date_utils.clone(start)
		let index = 0

		this.grid_highlights_weekend = []

		while (index < total) {
			now = date_utils.add(now, 1, 'day')

			if (now.getDay() === 6) {
				const colX = column_width * (index + 1)

				const element = createSVG('rect', {
					x: colX + resource_width,
					y: 0,
					height: '100%',
					width: column_width * 2,
					class: 'weekend-highlight',
					append_to: this.layers.grid,
				})

				this.grid_highlights_weekend.push(element)
			}

			index++
		}
	}

	make_grid_highlights_past_days(column_width, resource_width) {
		const today = date_utils.today()
		const diff = date_utils.diff(today, this.gantt_start, 'day')

		this.grid_highlights_past_days = createSVG('rect', {
			x: resource_width,
			y: 0,
			height: '100%',
			width: column_width * diff,
			class: 'past-days-highlight',
			append_to: this.layers.grid,
		})
	}

	make_dates() {
		this.text_dates = []
		this.text_dates_upper = []

		for (let date of this.get_dates_to_draw()) {
			const text_date = createSVG('text', {
				x: this.resource_width + date.lower_x,
				y: date.lower_y,
				innerHTML: date.lower_text,
				class: 'lower-text',
				append_to: this.layers.date,
			})

			this.text_dates.push(text_date)

			if (date.upper_text) {
				const text_date_upper = createSVG('text', {
					x: this.resource_width + date.upper_x,
					y: date.upper_y,
					innerHTML: date.upper_text,
					class: 'upper-text',
					append_to: this.layers.date,
				})

				if (text_date_upper.getBBox().x2 > this.layers.grid.getBBox().width) {
					text_date_upper.remove()
				} else {
					this.text_dates_upper.push(text_date_upper)
				}
			}
		}
	}

	get_dates_to_draw() {
		let last_date = null

		const monthPerYears = {}

		if (this.options.view_mode === VIEW_MODE.MONTH) {
			this.dates.forEach(date => {
				if (monthPerYears[date.getFullYear()]) {
					monthPerYears[date.getFullYear()] += 1
				} else {
					monthPerYears[date.getFullYear()] = 1
				}
			})
		}

		const dates = this.dates.map((date, i) => {
			const d = this.get_date_info(date, last_date, i, monthPerYears)

			last_date = date

			return d
		})

		return dates
	}

	get_date_info(date, last_date, i, monthPerYears) {
		if (!last_date) {
			last_date = date_utils.add(date, 1, 'year')
		}

		const date_text = {
			Hour_lower: date_utils.format(date, 'HH', this.options.language),
			'Quarter Day_lower': date_utils.format(date, 'HH', this.options.language),
			'Half Day_lower': date_utils.format(date, 'HH', this.options.language),
			Day_lower:
				date.getDate() !== last_date.getDate()
					? date_utils.format(date, 'D ddd', this.options.language)
					: '',
			Week_lower:
				date.getMonth() !== last_date.getMonth()
					? date_utils.format(date, 'D MMM', this.options.language)
					: date_utils.format(date, 'D', this.options.language),
			Month_lower: date_utils.format(date, 'MMMM', this.options.language),
			Year_lower: date_utils.format(date, 'YYYY', this.options.language),
			Hour_upper:
				date.getDate() !== last_date.getDate()
					? date_utils.format(date, 'D MMM', this.options.language)
					: '',
			'Quarter Day_upper':
				date.getDate() !== last_date.getDate()
					? date_utils.format(date, 'D MMM YYYY', this.options.language)
					: '',
			'Half Day_upper':
				date.getDate() !== last_date.getDate()
					? date.getMonth() !== last_date.getMonth()
						? date_utils.format(date, 'D MMM YYYY', this.options.language)
						: date_utils.format(date, 'D ddd', this.options.language)
					: '',
			Day_upper:
				date.getMonth() !== last_date.getMonth()
					? date_utils.format(date, 'MMMM YYYY', this.options.language)
					: '',
			Week_upper:
				date.getMonth() !== last_date.getMonth()
					? date_utils.format(date, `MMMM YYYY`, this.options.language)
					: '',
			Month_upper:
				date.getFullYear() !== last_date.getFullYear()
					? date_utils.format(date, 'YYYY', this.options.language)
					: '',
			Year_upper:
				date.getFullYear() !== last_date.getFullYear()
					? date_utils.format(date, 'YYYY', this.options.language)
					: '',
		}

		const base_pos = {
			x: i * this.column_width,
			lower_y: this.options.header_height,
			upper_y: this.options.header_height - 25,
		}

		const x_pos = {
			Hour_lower: 0,
			Hour_upper: (this.column_width * 24) / 2,
			'Quarter Day_lower': 0,
			'Quarter Day_upper': (this.column_width * 4) / 2,
			'Half Day_lower': 0,
			'Half Day_upper': (this.column_width * 2) / 2,
			Day_lower: this.column_width / 2,
			Day_upper: (this.column_width * 30) / 2,
			Week_lower: 0,
			Week_upper: (this.column_width * 4) / 2,
			Month_lower: this.column_width / 2,
			Month_upper: (this.column_width * monthPerYears[date.getFullYear()]) / 2,
			Year_lower: this.column_width / 2,
			Year_upper: (this.column_width * 30) / 2,
		}

		return {
			upper_text: date_text[`${this.options.view_mode}_upper`],
			lower_text: date_text[`${this.options.view_mode}_lower`],
			upper_x: base_pos.x + x_pos[`${this.options.view_mode}_upper`],
			upper_y: base_pos.upper_y,
			lower_x: base_pos.x + x_pos[`${this.options.view_mode}_lower`],
			lower_y: base_pos.lower_y,
		}
	}

	make_bars() {
		this.bar_map = {}

		this.bars = this.tasks.map(task => {
			const bar = new Bar(this, task, this.resource_width)

			this.layers.bar.appendChild(bar.group)

			this.bar_map[task.id] = bar

			return bar
		})
	}

	make_arrows() {
		this.arrows = []

		if (!this.options.hasArrows) return

		for (let task of this.tasks) {
			let arrows = []

			arrows = task.dependencies
				.map(task_id => {
					const dependency = this.get_task(task_id)

					if (!dependency) return

					const from_task = this.get_bar(dependency.id)

					const to_task = this.get_bar(task.id)

					if (!from_task || !to_task) return

					const arrow = new Arrow(this, from_task, to_task)

					this.layers.arrow.appendChild(arrow.element)

					return arrow
				})
				.filter(Boolean) // filter falsy values

			this.arrows = this.arrows.concat(arrows)
		}
	}

	remake_arrows() {
		this.arrows = []
		this.layers.arrow.innerHTML = ''

		this.make_arrows()
		this.map_arrows_on_bars()
	}

	map_arrows_on_bars() {
		if (!this.options.hasArrows) return

		for (let task_id in this.bar_map) {
			const bar = this.get_bar(task_id)

			bar.arrows = this.arrows.filter(
				arrow =>
					arrow.from_task.task.id === bar.task.id ||
					arrow.to_task.task.id === bar.task.id
			)
		}
	}

	set_width() {
		const actual_width = this.$svg.querySelector('.grid .grid-row')
			? this.$svg.querySelector('.grid .grid-row').getAttribute('width')
			: 0

		this.$svg.setAttribute('width', actual_width)
	}

	set_scroll_position() {
		const parent_element = this.$svg.parentElement

		if (!parent_element) return

		const hours_before_first_task = date_utils.diff(
			this.get_oldest_starting_date(),
			this.gantt_start,
			'hour'
		)

		const scroll_pos =
			(hours_before_first_task / this.step) * this.column_width -
			this.column_width

		parent_element.scrollLeft = scroll_pos
	}

	scrolling_today() {
		const dateChilds = [...this.layers.date.children]
		const th = 'today-highlight'
		const today = dateChilds.find(item => item.getAttribute('class') === th)

		if (!today) return

		const posX = today.getX()

		if (!posX) return

		const colsWidth = this.column_width * 2
		const clientWidth = this.$container.clientWidth / 2
		const width = clientWidth + this.resource_width - colsWidth
		const left = posX - width
		const top = this.$container.scrollTop

		this.$container.scrollTo(left, top)
	}

	bind_grid_events() {
		const elements = [
			'.grid',
			'.grid-row',
			'.weekend-highlight',
			'.past-days-highlight',
			'.arrow path',
			'.row-line',
			'.tick',
		]

		let scrolling_active = false
		let x_on_start
		let y_on_start
		let left
		let top

		$.on(this.$svg, this.options.popup_trigger, elements, () => {
			this.unselect_all()
			this.hide_popup()
		})

		$.on(this.$container, 'mousedown', elements, e => {
			scrolling_active = true

			x_on_start = e.clientX
			y_on_start = e.clientY

			left = this.$container.scrollLeft
			top = this.$container.scrollTop

			this.unselect_all()
			this.hide_popup()
		})

		$.on(this.$container, 'mousemove', elements, e => {
			if (!scrolling_active) return

			const dx = e.clientX - x_on_start
			const dy = e.clientY - y_on_start

			this.$container.scrollTo(left - dx, top - dy)
		})

		$.on(this.$container, 'mouseup', () => {
			scrolling_active = false
		})

		$.on(this.$container, 'mouseout', () => {
			scrolling_active = false
		})
	}

	bind_bar_events() {
		if (this.options.readonly) return

		if (!this.options.draggable_bar_handles) {
			this.bind_bar_progress()

			return
		}

		let is_dragging = false
		let x_on_start = this.resource_width || 0
		let x_on_scroll_start = 0
		let is_resizing_left = false
		let is_resizing_right = false
		let parent_bar_id = null
		let bars = [] // instanceof Bar

		this.bar_being_dragged = null

		function action_in_progress() {
			return is_dragging || is_resizing_left || is_resizing_right
		}

		$.on(this.$svg, 'mousedown', '.bar-wrapper, .handle', (e, element) => {
			const bar_wrapper = $.closest('.bar-wrapper', element)

			if (element.classList.contains('left')) {
				is_resizing_left = true
			} else if (element.classList.contains('right')) {
				is_resizing_right = true
			} else if (element.classList.contains('bar-wrapper')) {
				is_dragging = true
			}

			bar_wrapper.classList.add('active')

			x_on_start = e.clientX

			parent_bar_id = bar_wrapper.getAttribute(DATA_ATTR.ID)

			const ids = [
				parent_bar_id,
				...this.get_all_dependent_tasks(parent_bar_id),
			]

			bars = ids.map(id => this.get_bar(id))

			this.bar_being_dragged = parent_bar_id

			bars.forEach(bar => {
				const $bar = bar.$bar

				$bar.ox = $bar.getX()
				$bar.oy = $bar.getY()
				$bar.owidth = $bar.getWidth()
				$bar.finaldx = 0
			})
		})

		$.on(this.$svg, 'mousemove', e => {
			if (!action_in_progress()) return

			const dx = e.clientX - x_on_start

			bars.forEach(bar => {
				const $bar = bar.$bar

				$bar.finaldx = this.get_snap_position(dx)

				this.hide_popup()

				const { move_dependent } = this.options

				if (is_resizing_left) {
					if (parent_bar_id === bar.task.id) {
						bar.update_bar_position({
							x: $bar.ox + $bar.finaldx,
							width: $bar.owidth - $bar.finaldx,
						})
					} else if (move_dependent === 'left' || move_dependent === 'both') {
						bar.update_bar_position({
							x: $bar.ox + $bar.finaldx,
						})
					}
				} else if (is_resizing_right) {
					if (parent_bar_id === bar.task.id) {
						bar.update_bar_position({
							width: $bar.owidth + $bar.finaldx,
						})
					} else if (move_dependent === 'right' || move_dependent === 'both') {
						bar.update_bar_position({
							x: $bar.ox + $bar.finaldx,
						})
					}
				} else if (is_dragging && this.options.draggable_bar) {
					bar.update_bar_position({ x: $bar.ox + $bar.finaldx })
				}
			})
		})

		document.addEventListener('mouseup', () => {
			if (is_dragging || is_resizing_left || is_resizing_right) {
				bars.forEach(bar => bar.group.classList.remove('active'))
			}

			is_dragging = false
			is_resizing_left = false
			is_resizing_right = false
		})

		$.on(this.$container, 'scroll', e => {
			this.hide_popup()

			let elements = document.querySelectorAll('.bar-wrapper')
			let localBars = []
			let dx

			const ids = []

			this.layers.date.setAttribute(
				'transform',
				'translate(0,' + e.currentTarget.scrollTop + ')'
			)

			if (x_on_scroll_start) {
				dx = e.currentTarget.scrollLeft - x_on_scroll_start
			}

			Array.prototype.forEach.call(elements, function (el) {
				ids.push(el.getAttribute(DATA_ATTR.ID))
			})

			if (dx && this.options.horizontal_auto_scroll_labels) {
				localBars = ids.map(id => this.get_bar(id))

				localBars.forEach(bar => {
					bar.update_label_position_on_horizontal_scroll({
						x: dx,
						sx: e.currentTarget.scrollLeft,
					})
				})
			}

			x_on_scroll_start = e.currentTarget.scrollLeft

			if (this.options.resource_fixed) {
				this.layers.resource_title.setAttribute(
					'transform',
					`translate(${x_on_scroll_start}, ${e.currentTarget.scrollTop})`
				)

				this.layers.resource.setAttribute(
					'transform',
					`translate(${x_on_scroll_start},0)`
				)

				this.layers.resource_bg.setAttribute(
					'transform',
					`translate(${x_on_scroll_start},0)`
				)
			}
		})

		$.on(this.$svg, 'mouseup', () => {
			this.bar_being_dragged = null

			bars.forEach(bar => {
				const $bar = bar.$bar

				if (!$bar.finaldx) return

				$bar.finaldx = 0

				bar.date_changed()
				bar.set_action_completed()
			})
		})

		this.bind_bar_progress()
	}

	bind_resource_events() {
		let is_resizing = false
		let x_on_start
		let $resource_resize = null

		$.on(this.$svg, 'click', '.resource-text.-task', (event, element) => {
			this.hide_popup()

			const id = element.getAttribute(DATA_ATTR.ID)

			const bar = this.get_bar(id)

			const grid_row_width = this.resource_header_row.getWidth()

			const left = bar.x - (grid_row_width + 50)

			this.$container.scrollTo(left, this.$container.scrollTop)
		})

		if (this.options.resource_collapse_enable) {
			$.on(
				this.$svg,
				'click',
				[
					'.resource-text.-group',
					'.resource-text.-sub-group',
					'.resource-pointer',
				],
				(e, element) => {
					this.hide_popup()

					const group_id = element.getAttribute(DATA_ATTR.GROUP_ID)
					const sub_group_id = element.getAttribute(DATA_ATTR.SUB_GROUP_ID)

					let selector = group_id ? `[data-group-id="${group_id}"]` : ''
					let start
					let is_open

					if (sub_group_id) {
						selector = `[data-sub-group-id="${sub_group_id}"]`

						start = this.resource_tree.findIndex(
							rt =>
								rt.group_id == group_id &&
								rt.type !== 'task' &&
								rt.sub_group_id == sub_group_id
						)
					} else {
						start = this.resource_tree.findIndex(
							rt => rt.group_id == group_id && rt.type !== 'task'
						)
					}

					const arrow = document.querySelector(selector + '.resource-arrow')

					this.set_transform_origin_element(arrow)

					selector += ':not(.resource-pointer)'

					const els = document.querySelectorAll(selector)

					const toggle = els[0].getAttribute(DATA_ATTR.TOGGLE)

					if (!toggle || toggle === DATA_OPEN.OPEN) {
						els[0].setAttribute(DATA_ATTR.TOGGLE, DATA_OPEN.CLOSE)

						arrow.classList.add('-close')

						is_open = false
					} else {
						els[0].setAttribute(DATA_ATTR.TOGGLE, DATA_OPEN.OPEN)

						arrow.classList.remove('-close')

						is_open = true
					}

					start++

					const end = start + els.length - 2

					const elements = this.get_open_hide_elements(start, end)

					this.resource_tree_open_hide({
						...elements,
						is_open,
					})
					this.reset_index()
					this.remake_arrows()
					this.display_arrows()
					this.vertical_resize_gantt()
				}
			)
		}

		if (this.options.resource_resize_enable) {
			let dx
			let posX

			$.on(this.$svg, 'mousedown', '.resource-resize', e => {
				is_resizing = true
				x_on_start = e.clientX

				$resource_resize = this.resource_line
				$resource_resize.owidth = this.resource_line.getWidth()
				$resource_resize.ox = this.resource_line.getX()
			})

			$.on(this.$svg, 'mousemove', e => {
				if (!is_resizing) return

				dx = e.clientX - x_on_start

				posX = $resource_resize.ox + dx

				if (
					!posX ||
					isNaN(posX) ||
					posX <= this.column_width ||
					posX <= this.resource_width - 200 ||
					posX >= this.resource_width + 200
				) {
					return
				}

				this.resource_line.setAttribute('x', posX)
				this.resource_header_row.setAttribute('width', posX)
				this.resource_header_line.setAttribute('width', posX)
				this.resource_background.setAttribute('width', posX)
				this.resource_background_r_clip.setAttribute('width', posX)
				this.resource_header_text.setAttribute('width', posX)
				this.resource_grid_layer.forEach(x => {
					x.setAttribute('width', posX)
				})
				this.resource_line_grid_layer.forEach(x => {
					x.setAttribute('width', posX)
				})
			})

			$.on(this.$svg, 'mouseup', () => {
				if (!is_resizing) return

				is_resizing = false

				this.resource_item_title_list.forEach(x => {
					const { element, padding, name } = x

					element.setAttribute('width', posX)

					this.utilities.text_ellipsis(element, name, posX - padding)
				})

				this.text_dates.forEach(x => {
					x.setAttribute('x', x.getX() + dx)
				})

				this.text_dates_upper.forEach(x => {
					x.setAttribute('x', x.getX() + dx)
				})

				this.set_x_grid_highlights(dx, posX)
			})
		}
	}

	set_x_grid_highlights(dx, posX) {
		const line1 = this.today_highlight_line_1
		const line2 = this.today_highlight_line_2

		line1.setAttribute('x', line1.getX() + dx)
		line2.setAttribute('x', line2.getX() + dx)

		this.grid_highlights_weekend.forEach(x => {
			x.setAttribute('x', x.getX() + dx)
		})

		this.grid_ticks.forEach(x => {
			x.setAttribute('x', x.getX() + dx)
		})

		this.grid_highlights_past_days.setAttribute('x', posX)
	}

	set_transform_origin_element(element) {
		const { x, y } = element.getBBox()
		const w = element.getWidth() / 2
		const h = element.getHeight() / 2

		element.setAttribute('transform-origin', `${x + w}px ${y + h}px`)
	}

	get_open_hide_elements(start, end) {
		let [childRows, childTexts, childLines] = this.layers.resource.children

		const firstText = [...childTexts.children][start - 1]
		const firstType = firstText.getAttribute(DATA_ATTR.TYPE)

		const rows = [...childRows.children].filter(
			(c, i) => i >= start && i <= end
		)

		const texts = [...childTexts.children].filter(
			(c, i) => i >= start && i <= end
		)

		const lines = [...childLines.children]
			.filter(c => c.nodeName === 'line')
			.filter((c, i) => i >= start && i <= end)

		const nextRows = [...childRows.children].filter((c, i) => i > end)

		const nextTexts = [...childTexts.children].filter((c, i) => i > end)

		const nextLines = [...childLines.children]
			.filter(c => c.nodeName === 'line')
			.filter((c, i) => i > end)

		return {
			rows,
			texts,
			lines,
			nextRows,
			nextTexts,
			nextLines,
			firstType,
		}
	}

	reset_index() {
		const g_texts = this.get_g_texts()

		let index = 0

		for (let i = 0; i < g_texts.length; i++) {
			const g = g_texts[i]

			if (
				g.getAttribute(DATA_ATTR.TYPE) === DATA_TYPE.WORKITEM &&
				g.getAttribute(DATA_ATTR.ID)
			) {
				const task = this.get_task(g.getAttribute(DATA_ATTR.ID))

				if (task) {
					task._index = index
				}
			}

			if (
				g.getAttribute(DATA_ATTR.OPEN) === DATA_OPEN.OPEN &&
				g.getAttribute(DATA_ATTR.OPACITY) !== '0'
			) {
				index++
			}
		}
	}

	display_arrows() {
		this.arrows.forEach(arrow => {
			const display_from = arrow.from_task.bar_group.getAttribute('display')
			const display_to = arrow.to_task.bar_group.getAttribute('display')

			const display =
				display_from === 'none' || display_to === 'none' ? 'none' : 'block'

			arrow.element.setAttribute('display', display)
		})
	}

	open_close_bar(text, is_next, is_open, texts, rows_height) {
		const childrens = Array.from(text.children)

		const element = childrens.find(child => child.getAttribute(DATA_ATTR.ID))

		if (!element) return

		const task_id = element.getAttribute(DATA_ATTR.ID)

		if (!task_id) return

		const bar = this.bars.find(bar => bar.task.id == task_id)

		if (!bar || !bar.bar_group) return

		let y = 0

		if (is_next) {
			const rows_affected = texts.filter(
				t => t.getAttribute(DATA_ATTR.TYPE) !== DATA_TYPE.GROUP
			).length

			const height = rows_affected * rows_height

			y = is_open ? height : height * -1

			if (bar.bar_group) {
				const bar_groups = [...bar.bar_group.children]

				let el_y = 0

				bar_groups.forEach(el => {
					el_y = el.getY() + y

					el.setAttribute('y', el_y)
				})

				if (bar.arrows) {
					bar.arrows.forEach(arrow => {
						arrow.from_task.y = el_y
					})
				}
			}

			if (bar.handle_group) {
				const handle_groups = [...bar.handle_group.children]

				handle_groups.forEach(el => {
					el.setAttribute('y', el.getY() + y)
				})
			}
		} else {
			const display = is_open ? 'block' : 'none'

			bar.bar_group.setAttribute('display', display)
		}
	}

	vertical_resize_gantt() {
		const g_texts = this.get_g_texts()

		const rows_height = this.get_rows_height()

		const total_rows = g_texts.reduce((value, g) => {
			const is_open =
				g.getAttribute(DATA_ATTR.OPEN) !== DATA_OPEN.CLOSE &&
				g.getAttribute(DATA_ATTR.OPACITY) !== '0'

			return is_open ? value + 1 : value
		}, 0)

		let height = rows_height * total_rows
		height += this.options.header_height
		height += this.options.padding / 2

		this.$svg.setAttribute('height', height)
	}

	resource_tree_open_hide({
		rows,
		texts,
		lines,
		nextRows,
		nextTexts,
		nextLines,
		firstType,
		is_open,
	}) {
		const opacity = is_open ? '1' : '0'
		const open = is_open ? DATA_OPEN.OPEN : DATA_OPEN.CLOSE

		const rows_height = this.get_rows_height()

		texts = texts.filter(
			text =>
				text.getAttribute(DATA_ATTR.TYPE_PARENT) === firstType ||
				(text.getAttribute(DATA_ATTR.TYPE_PARENT) !== firstType &&
					text.getAttribute(DATA_ATTR.OPEN) === DATA_OPEN.OPEN)
		)

		texts.forEach((text, i) => {
			if (text.getAttribute(DATA_ATTR.TYPE_PARENT) === firstType) {
				text.setAttribute(DATA_ATTR.OPEN, open)
			}

			text.setAttribute('opacity', opacity)

			rows[i].setAttribute('opacity', opacity)

			lines[i].setAttribute('opacity', opacity)

			this.open_close_bar(text, false, is_open)
		})

		if (nextRows.length) {
			const y_size = rows_height * texts.length

			nextLines.forEach(line => line.setAttribute('opacity', opacity))

			nextRows.forEach(row => {
				if (is_open) {
					row.setAttribute('y', row.getY() + y_size)
				} else {
					row.setAttribute('y', row.getY() - y_size)
				}
			})

			nextTexts.forEach(text => {
				this.open_close_bar(text, true, is_open, texts, rows_height)

				Array.from(text.children).forEach(el => {
					if (is_open) {
						el.setAttribute('y', el.getY() + y_size)
					} else {
						el.setAttribute('y', el.getY() - y_size)
					}

					if (el.getAttribute('transform-origin')) {
						this.set_transform_origin_element(el)
					}
				})
			})
		}
	}

	bind_bar_progress() {
		let x_on_start = this.resource_width || 0
		let is_resizing = null
		let bar = null
		let $bar_progress = null
		let $bar = null

		$.on(this.$svg, 'mousedown', '.handle.progress', (e, handle) => {
			is_resizing = true

			x_on_start = e.clientX

			const $bar_wrapper = $.closest('.bar-wrapper', handle)
			const id = $bar_wrapper.getAttribute(DATA_ATTR.ID)

			bar = this.get_bar(id)

			$bar_progress = bar.$bar_progress
			$bar = bar.$bar

			$bar_progress.finaldx = 0
			$bar_progress.owidth = $bar_progress.getWidth()
			$bar_progress.min_dx = -$bar_progress.getWidth()
			$bar_progress.max_dx = $bar.getWidth() - $bar_progress.getWidth()
		})

		$.on(this.$svg, 'mousemove', e => {
			if (!is_resizing) return

			let dx = e.clientX - x_on_start

			if (dx > $bar_progress.max_dx) {
				dx = $bar_progress.max_dx
			}

			if (dx < $bar_progress.min_dx) {
				dx = $bar_progress.min_dx
			}

			const $handle = bar.$handle_progress

			$.attr($bar_progress, 'width', $bar_progress.owidth + dx)
			$.attr($handle, 'points', bar.get_progress_polygon_points())

			$bar_progress.finaldx = dx
		})

		$.on(this.$svg, 'mouseup', () => {
			is_resizing = false

			if (!($bar_progress && $bar_progress.finaldx)) return

			$bar_progress.finaldx = 0

			bar.progress_changed()
			bar.set_action_completed()
		})
	}

	get_g_texts() {
		const [, childTexts] = this.layers.resource.children

		return [...childTexts.children]
	}

	get_rows_height() {
		const height = this.options.bar_height + this.options.padding

		return height
	}

	get_all_dependent_tasks(task_id) {
		let out = []
		let to_process = [task_id]

		while (to_process.length) {
			const deps = to_process.reduce(
				(acc, curr) => acc.concat(this.dependency_map[curr]),
				[]
			)

			out = out.concat(deps)

			to_process = deps.filter(d => !to_process.includes(d))
		}

		return out.filter(Boolean)
	}

	get_snap_position(dx) {
		let odx = dx,
			rem,
			position

		if (this.view_is(VIEW_MODE.WEEK)) {
			rem = dx % (this.column_width / 7)
			position =
				odx - rem + (rem < this.column_width / 14 ? 0 : this.column_width / 7)
		} else if (this.view_is(VIEW_MODE.MONTH)) {
			rem = dx % (this.column_width / 30)
			position =
				odx - rem + (rem < this.column_width / 60 ? 0 : this.column_width / 30)
		} else {
			rem = dx % this.column_width
			position =
				odx - rem + (rem < this.column_width / 2 ? 0 : this.column_width)
		}

		return position
	}

	unselect_all() {
		let bars = this.$svg.querySelectorAll('.bar-wrapper')

		bars = [...bars]

		bars.forEach(el => el.classList.remove('active'))
	}

	view_is(modes) {
		if (typeof modes === 'string') {
			return this.options.view_mode === modes
		}

		if (Array.isArray(modes)) {
			return modes.some(mode => this.options.view_mode === mode)
		}

		return false
	}

	get_task(id) {
		return this.task_map[id]
	}

	get_bar(id) {
		return this.bar_map[id]
	}

	show_popup(options) {
		if (!this.popup) {
			this.popup = new Popup(
				this,
				this.popup_wrapper,
				this.options.custom_popup_html,
				this.$container
			)
		}

		this.popup.show(options)
	}

	hide_popup() {
		this.popup && this.popup.hide()
	}

	trigger_event(event, args) {
		if (this.options['on_' + event]) {
			this.options['on_' + event].apply(null, args)
		}
	}

	get_oldest_starting_date() {
		if (!this.tasks.length) return this.gantt_start

		return this.tasks
			.map(task => task._start)
			.reduce((prev_date, cur_date) =>
				cur_date <= prev_date ? cur_date : prev_date
			)
	}

	clear() {
		this.$svg.innerHTML = ''
	}
}
