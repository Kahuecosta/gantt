import date_utils from './date_utils'
import { $, createSVG } from './svg_utils'
import Bar from './bar'
import Arrow from './arrow'
import Popup from './popup'
import './assets/gantt.scss'
import {
	VIEW_MODE,
	TEAMS_TYPES,
	TEAMS_TYPES_ARR,
	RESPONSABLE_DEFAULT_ID,
	RESPONSABLE_TYPES,
	RESPONSABLE_TYPES_ARR,
} from './constants'

export default class Gantt {
	constructor(
		wrapper,
		workItems,
		workItemTypes,
		responsables = [],
		teams = [],
		options
	) {
		this.VIEW_MODE = VIEW_MODE

		this.setup_wrapper(wrapper)
		this.setup_options(options)
		this.setup_responsables(responsables)
		this.setup_teams(teams)
		this.setup_workItem_types(workItemTypes)
		this.setup_tasks(workItems)

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
			column_width: 150,
			column_width: 50,
			step: 24,
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
			draggable: true,
			hasArrows: true,
			move_dependent: 'left',
			padding_start: null,
			padding_end: null,
			fixed_label_location: false,
			hide_labels: false,
			horizontal_auto_scroll_labels: false,
			is_draggable: true,
			handle_bar_color: '#752f00',
			handle_progress_color: '#752f00',
			resource_resize_enable: true,
			resource_fixed: false,
			resource_enable: false,
			resource_title: 'Tasks',
			resource_width: 250,
			responsables_enable: false,
			responsables_sort_by: 'default', // 'default' - 'name'
			responsables_default_name: 'Não atribuido',
			responsables_default_photo: './images-example/responsable-default.png',
			teams_enable: false,
			teams_sort_by: 'name', // 'default' - 'name'
			rows_alternate_background: true,
			grid_ticks: true,
			bar_color_default: '#FFCC33',
			highlights_weekend: true,
			highlights_past_days: true,
			link_detail_text: 'Ver detalhes',
		}

		this.options = Object.assign({}, default_options, options)
	}

	setup_teams(teams) {
		if (this.options.teams_enable) {
			this.teams = teams

			this.sort_teams()
		} else {
			this.teams = []
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

		if (!RESPONSABLE_TYPES_ARR.includes(responsables_sort_by)) {
			throw new TypeError('The responsables_sort_by is invalid!')
		}

		if (responsables_sort_by === RESPONSABLE_TYPES.DEFAULT) {
		}

		if (responsables_sort_by === RESPONSABLE_TYPES.NAME) {
			this.responsables = responsables.sort((a, b) => {
				if (a.name > b.name) return 1

				if (a.name < b.name) return -1

				return 0
			})
		}
	}

	sort_teams() {
		const { teams_sort_by } = this.options

		if (!TEAMS_TYPES_ARR.includes(teams_sort_by)) {
			throw new TypeError('The teams_sort_by is invalid!')
		}

		if (teams_sort_by === TEAMS_TYPES.DEFAULT) {
		}

		if (teams_sort_by === TEAMS_TYPES.NAME) {
			this.teams = teams.sort((a, b) => {
				if (a.name > b.name) return 1

				if (a.name < b.name) return -1

				return 0
			})
		}
	}

	sort_tasks_by_responsable(tasks) {
		if (!this.options.responsables_enable) {
			return tasks
		}

		let ordened_tasks = []

		this.responsables.forEach(responsable => {
			const list_tasks = tasks.filter(
				task => task.responsable_id === responsable.id
			)

			ordened_tasks = [...ordened_tasks, ...list_tasks]
		})

		return ordened_tasks
	}

	sort_tasks_by_teams(tasks) {
		if (!this.options.teams_enable) {
			return tasks
		}

		let ordened_tasks = []

		this.teams.forEach(team => {
			const list_tasks = tasks.filter(task => task.team_id === team.id)

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

	set_task_index_by_teams() {
		let index = 0

		this.resource_tree.forEach(item => {
			if (item.type === 'teams' || item.type === 'sub_group') {
				index++
			} else {
				const task = this.get_task(item.task_id)

				task._index = index

				index++
			}
		})
	}

	resource_tree_team_push_task(team, sub_group) {
		let tasks = [...this.tasks]

		if (team) {
			tasks = tasks.filter(task => task.team_id === team.id)
		}

		if (sub_group) {
			tasks = tasks.filter(task => task.sub_group_id === sub_group.id)
		}

		tasks.forEach(task => {
			this.resource_tree.push({
				type: 'task',
				task_id: task.id,
				team_id: team.id,
				sub_group_id: sub_group ? sub_group.id : null,
			})
		})
	}

	set_resource_tree() {
		const { responsables_enable, teams_enable } = this.options

		this.resource_tree = []

		if (!responsables_enable && !teams_enable) {
			this.resource_tree = this.tasks.map(task => ({
				type: 'task',
				task_id: task.id,
			}))

			return
		}

		if (teams_enable) {
			this.teams.forEach(team => {
				this.resource_tree.push({
					type: 'teams',
					team_id: team.id,
					team_name: team.name,
					team_icon: team.icon,
					team_color: team.color,
				})

				if (team.sub_group) {
					team.sub_group.forEach(sg => {
						this.resource_tree.push({
							type: 'sub_group',
							sub_group_id: sg.id,
							sub_group_name: sg.name,
							sub_group_icon: sg.icon,
							sub_group_color: sg.color,
						})

						this.resource_tree_team_push_task(team, sg)
					})
				} else {
					team.sub_group = []

					this.resource_tree_team_push_task(team)
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
				task.id = this.generate_id(task)
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

			// workItem teams
			if (
				typeof task.team_id !== 'undefined' &&
				this.teams.hasOwnProperty(task.team_id)
			) {
				task._team = this.teams.find(item => item.id === task.team_id)
			}

			this.task_map[task.id] = task

			return task
		})

		if (this.options.teams_enable) {
			this.tasks = this.sort_tasks_by_teams(tasks_map)
		} else {
			this.tasks = this.sort_tasks_by_responsable(tasks_map)
		}

		this.set_resource_tree()

		if (this.options.teams_enable) {
			this.set_task_index_by_teams()
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
		// fire viewmode_change event
		this.trigger_event('view_change', [mode])
	}

	update_view_scale(view_mode) {
		this.options.view_mode = view_mode

		if (view_mode === VIEW_MODE.HOUR) {
			this.options.step = 24 / 24
			this.options.column_width = 38
		} else if (view_mode === VIEW_MODE.DAY) {
			this.options.step = 24
			this.options.column_width = 60
		} else if (view_mode === VIEW_MODE.HALF_DAY) {
			this.options.step = 24 / 2
			this.options.column_width = 60
		} else if (view_mode === VIEW_MODE.QUARTER_DAY) {
			this.options.step = 24 / 4
			this.options.column_width = 60
		} else if (view_mode === VIEW_MODE.WEEK) {
			this.options.step = 24 * 7
			this.options.column_width = 140
		} else if (view_mode === VIEW_MODE.MONTH) {
			this.options.step = 24 * 30
			this.options.column_width = 120
		} else if (view_mode === VIEW_MODE.YEAR) {
			this.options.step = 24 * 365
			this.options.column_width = 120
		}
	}

	setup_dates() {
		this.setup_gantt_dates()
		this.setup_date_values()
	}

	setup_gantt_dates() {
		this.gantt_start = this.gantt_end = null

		for (let task of this.tasks) {
			// set global start and end date
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

		// add date padding on both sides
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
					cur_date = date_utils.add(cur_date, this.options.step, 'hour')
				}
			}

			this.dates.push(cur_date)
		}
	}

	bind_events() {
		this.bind_grid_click()
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
			'resource',
			'resource_title',
		]

		// make group layers
		for (let layer of layers) {
			this.layers[layer] = createSVG('g', {
				class: layer,
				append_to: this.$svg,
			})
		}
	}

	make_resource() {
		if (!this.options.resource_enable) {
			this.resource_width = 0

			return
		}

		//define width size
		this.resource_width = this.options.resource_width - 30

		this.resource_grid_layer = []
		this.resource_line_grid_layer = []
		this.resource_item_title_list = []

		const grid_layer = createSVG('g', { append_to: this.layers.resource })
		const text_layer = createSVG('g', { append_to: this.layers.resource })
		const lines_layer = createSVG('g', { append_to: this.layers.resource })

		const row_width = this.options.resource_width
		const row_height = this.options.bar_height + this.options.padding

		let row_y = this.options.header_height + this.options.padding / 2

		const resource_title_layer = createSVG('g', {
			append_to: this.layers.resource_title,
		})

		// make resource
		this.resource_grid_row = createSVG('rect', {
			x: 1,
			y: 1,
			width: row_width,
			height: row_height + this.options.header_height - 32,
			class: 'grid-row teste',
			append_to: resource_title_layer,
		})

		this.resource_header_text = createSVG('text', {
			x: 20,
			y: row_y - 20,
			width: row_width,
			height: row_height,
			innerHTML: this.options.resource_title,
			class: 'header-text resource-title',
			append_to: resource_title_layer,
		})

		this.resource_grid_header_line = createSVG('line', {
			x1: 0,
			y1: row_y,
			x2: row_width,
			y2: row_y + 1,
			class: 'grid-header',
			append_to: resource_title_layer,
		})

		this.resource_line = createSVG('rect', {
			x: row_width,
			y: 0,
			width: 1,
			height: '100%',
			class: 'resource-line',
			append_to: lines_layer,
		})

		if (this.options.resource_resize_enable) {
			this.resource_resize = createSVG('image', {
				x: row_width - 8,
				y: 14,
				width: 16,
				height: 16,
				fill: '#000',
				class: 'resource-resize',
				href: 'dist/assets/resize.png',
				clipPath: 'clip_resize',
				append_to: resource_title_layer,
			})
		}

		let team_id

		this.resource_tree.forEach(tree => {
			let item

			if (tree.type === 'teams') {
				item = {
					name: tree.team_name,
					icon: tree.team_icon,
					team_color: tree.team_color,
					team_id: tree.team_id,
					is_team: true,
				}

				team_id = tree.team_id
			} else if (tree.type === 'sub_group') {
				item = {
					name: tree.sub_group_name,
					icon: tree.sub_group_icon,
					sub_group_color: tree.sub_group_color,
					sub_group_id: tree.sub_group_id,
					team_id,
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

			this.make_resource_text(item, row_y, row_width, row_height, text_layer)

			const task_grid_layer = createSVG('rect', {
				x: 0,
				y: row_y,
				width: row_width,
				height: row_height,
				class: 'grid-row',
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

			row_y += this.options.bar_height + this.options.padding
		})
	}

	make_resource_text(item, row_y, row_width, row_height, text_layer) {
		const { responsables_enable, teams_enable } = this.options

		let elY = row_y + row_height / 2 + 2
		let elX = 10
		let padding = 30
		let item_title_css = 'resource-text '

		if (teams_enable && item.is_team) {
			if (item.icon) {
				this.make_resource_team_icon(item.icon, text_layer, elY)
			} else {
				this.make_resource_team_color(item.team_color, text_layer, elY)
			}

			elX += 30
			elY += 3
			padding += 22
			item_title_css += '-team'
		} else if (teams_enable && item.is_sub_group) {
			if (item && item.icon) {
				this.make_resource_sub_group_icon(item.icon, text_layer, elY)
			} else {
				this.make_resource_sub_group_color(
					item.sub_group_color,
					text_layer,
					elY
				)
			}

			elX += 30
			elY += 3
			padding += 22
			item_title_css += '-sub-group'
		} else if (responsables_enable && item.is_responsable) {
			this.make_resource_responsable_photo(item.photo, text_layer, elY)

			elX += 30
			elY += 3
			padding += 22
			item_title_css += '-responsable'
		} else {
			item_title_css += '-task'

			if (responsables_enable || teams_enable) {
				elX += 20
			}

			if (teams_enable && responsables_enable) {
				this.make_resource_responsable_photo(
					item._responsable.photo,
					text_layer,
					elY,
					24,
					21
				)

				elY += 2
				elX += 26
				padding += 20
			}

			const type = this.workItemTypes[item.type_id]

			if (type) {
				this.make_resource_workitem_type(type, text_layer, elY, elX)

				elX += 20
				padding += 20
			}
		}

		const item_title = createSVG('text', {
			x: elX,
			y: elY,
			'data-id': item.id || '',
			'data-team-id': item.team_id || '',
			'data-sub-group-id': item.sub_group_id || '',
			class: item_title_css,
			append_to: text_layer,
		})

		this.resource_item_title_list.push({
			element: item_title,
			row_width,
			padding,
			name: item.name,
		})

		this.text_ellipsis(item_title, item.name, row_width - padding)
	}

	html_avatar(photo, w, y) {
		const avatar = `<img class="avatar" src="${photo}" width="${w}px" height="${y}px" />`

		return avatar
	}

	make_resource_responsable_photo(
		photo,
		text_layer,
		elY,
		elX = 8,
		img_wh = 25
	) {
		if (!photo) return

		createSVG('foreignObject', {
			x: elX,
			y: elY - 14,
			width: img_wh,
			height: img_wh,
			append_to: text_layer,
			innerHTML: this.html_avatar(photo, img_wh, img_wh),
		})
	}

	make_resource_team_icon(icon, text_layer, elY, elX = 8, img_wh = 25) {
		if (!icon) return

		createSVG('foreignObject', {
			x: elX,
			y: elY - 14,
			width: img_wh,
			height: img_wh,
			append_to: text_layer,
			innerHTML: this.html_avatar(icon, img_wh, img_wh),
		})
	}

	make_resource_team_color(color, text_layer, elY, elX = 8, img_wh = 25) {
		if (!color) return

		createSVG('rect', {
			x: elX,
			y: elY - 14,
			rx: img_wh,
			ry: img_wh,
			width: img_wh,
			height: img_wh,
			class: 'resource-team-icon',
			style: `fill:${color || '#000000'}`,
			append_to: text_layer,
		})
	}

	make_resource_sub_group_icon(icon, text_layer, elY, elX = 16, img_wh = 18) {
		createSVG('foreignObject', {
			x: elX,
			y: elY - 10,
			width: img_wh,
			height: img_wh,
			append_to: text_layer,
			innerHTML: this.html_avatar(icon, img_wh, img_wh),
		})
	}

	make_resource_sub_group_color(color, text_layer, elY, elX = 16, img_wh = 18) {
		createSVG('rect', {
			x: elX,
			y: elY - 10,
			rx: img_wh,
			ry: img_wh,
			width: img_wh,
			height: img_wh,
			class: 'resource-team-icon',
			style: `fill:${color || '#000000'}`,
			append_to: text_layer,
		})
	}

	make_resource_workitem_type(type, text_layer, elY, elX = 8, img_wh = 14) {
		if (type.icon) {
			createSVG('image', {
				x: elX,
				y: elY - 12,
				width: img_wh,
				height: img_wh,
				class: 'resource-type-icon-img',
				href: type.icon,
				clipPath: 'clip_' + type.id,
				append_to: text_layer,
			})
		} else if (type.color) {
			createSVG('rect', {
				x: elX,
				y: elY - 12,
				rx: img_wh,
				ry: img_wh,
				width: img_wh,
				height: img_wh,
				class: 'resource-type-icon',
				style: `fill:${type.color || '#000000'}`,
				append_to: text_layer,
			})
		}
	}

	text_ellipsis(el, text, width) {
		if (typeof el.getSubStringLength !== 'undefined') {
			el.innerHTML = text
			let len = text.length

			while (el.getSubStringLength(0, len--) > width) {
				el.innerHTML = text.slice(0, len) + '...'
			}
		} else if (typeof el.getComputedTextLength !== 'undefined') {
			while (el.getComputedTextLength() > width) {
				text = text.slice(0, -1)
				el.innerHTML = text + '...'
			}
		} else {
			// the last fallback
			while (el.getBBox().width > width) {
				text = text.slice(0, -1)
				// we need to update the textContent to update the boundary width
				el.innerHTML = text + '...'
			}
		}
	}

	make_grid() {
		this.make_grid_background()
		this.make_grid_rows()
		this.make_grid_header()
		this.make_grid_ticks()
		this.make_grid_highlights()
	}

	make_grid_background() {
		const grid_width =
			this.resource_width + this.dates.length * this.options.column_width

		const bar_height_padding = this.options.bar_height + this.options.padding

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
		const {
			column_width,
			header_height,
			bar_height,
			padding,
			rows_alternate_background,
		} = this.options

		const rows_layer = createSVG('g', { append_to: this.layers.grid })
		const lines_layer = createSVG('g', { append_to: this.layers.grid })

		const row_width = this.resource_width + this.dates.length * column_width

		const row_height = bar_height + padding

		const total_rows = this.resource_tree.length

		let row_y = header_height + padding / 2

		const grid_row_class = rows_alternate_background
			? 'grid-row -alt-bg'
			: 'grid-row'

		for (let i = 0; i < total_rows; i++) {
			createSVG('rect', {
				x: this.resource_width,
				y: row_y,
				width: row_width,
				height: row_height,
				class: grid_row_class,
				append_to: rows_layer,
			})

			createSVG('line', {
				x1: this.resource_width,
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
			this.resource_width + this.dates.length * this.options.column_width

		const header_height = this.options.header_height + 10

		createSVG('rect', {
			x: this.resource_width,
			y: 0,
			width: header_width,
			height: header_height,
			class: 'grid-header',
			// append_to: this.layers.grid,
			append_to: this.layers.date,
		})
	}

	make_grid_ticks() {
		if (!this.options.grid_ticks) return

		let tick_x = this.resource_width
		let tick_y = this.options.header_height + this.options.padding / 2
		let tick_height =
			(this.options.bar_height + this.options.padding) *
			this.resource_tree.length

		for (let date of this.dates) {
			let tick_class = 'tick'

			// thick tick for monday
			if (this.view_is(VIEW_MODE.DAY) && date.getDate() === 1) {
				tick_class += ' thick'
			}

			// thick tick for first week
			if (
				this.view_is(VIEW_MODE.WEEK) &&
				date.getDate() >= 1 &&
				date.getDate() < 8
			) {
				tick_class += ' thick'
			}

			// thick ticks for quarters
			if (this.view_is(VIEW_MODE.MONTH) && (date.getMonth() + 1) % 3 === 0) {
				tick_class += ' thick'
			}

			createSVG('path', {
				d: `M ${tick_x} ${tick_y} v ${tick_height}`,
				class: tick_class,
				append_to: this.layers.grid,
			})

			if (this.view_is(VIEW_MODE.MONTH)) {
				tick_x +=
					(date_utils.get_days_in_month(date) * this.options.column_width) / 30
			} else {
				tick_x += this.options.column_width
			}
		}
	}

	make_grid_highlights() {
		// highlight today's date
		if (!this.view_is(VIEW_MODE.DAY)) return

		const {
			column_width,
			step,
			padding,
			header_height,
			bar_height,
			highlights_weekend,
			highlights_past_days,
		} = this.options

		let resource_width = 0

		if (this.options.resource_enable) {
			resource_width = this.options.resource_width - 30
		}

		const today = date_utils.today()
		const diff = date_utils.diff(today, this.gantt_start, 'hour')
		const column_start = (diff / step) * column_width + resource_width
		const x = column_start + column_width / 2 - 1

		const height =
			(bar_height + padding) * this.resource_tree.length +
			header_height +
			padding / 2

		createSVG('rect', {
			x,
			y: 0,
			height,
			width: 2,
			class: 'today-highlight',
			append_to: this.layers.grid,
		})

		createSVG('rect', {
			x: column_start,
			y: header_height + 8,
			height: 2,
			width: column_width,
			class: 'today-highlight',
			append_to: this.layers.date,
		})

		if (highlights_past_days) {
			this.make_grid_highlights_past_days(column_width, resource_width, height)
		}

		if (highlights_weekend) {
			this.make_grid_highlights_weekend(column_width, resource_width, height)
		}
	}

	make_grid_highlights_weekend(column_width, resource_width, height) {
		const start = this.gantt_start
		const end = this.gantt_end
		const total = date_utils.diff(end, start, 'day')
		let now = date_utils.clone(start)
		let index = 0

		while (index < total) {
			now = date_utils.add(now, 1, 'day')

			if (now.getDay() === 6) {
				createSVG('rect', {
					x: column_width * (index + 1) + resource_width,
					y: 0,
					height,
					width: column_width * 2,
					class: 'weekend-highlight',
					append_to: this.layers.grid,
				})
			}

			index++
		}
	}

	make_grid_highlights_past_days(column_width, resource_width, height) {
		const today = date_utils.today()
		const diff = date_utils.diff(today, this.gantt_start, 'day')

		createSVG('rect', {
			x: resource_width,
			y: 0,
			height,
			width: column_width * diff,
			class: 'past-days-highlight',
			append_to: this.layers.grid,
		})
	}

	make_dates() {
		for (let date of this.get_dates_to_draw()) {
			createSVG('text', {
				x: this.resource_width + date.lower_x,
				y: date.lower_y,
				innerHTML: date.lower_text,
				class: 'lower-text',
				append_to: this.layers.date,
			})

			if (date.upper_text) {
				const $upper_text = createSVG('text', {
					x: this.resource_width + date.upper_x,
					y: date.upper_y,
					innerHTML: date.upper_text,
					class: 'upper-text',
					append_to: this.layers.date,
				})

				// remove out-of-bound dates
				if ($upper_text.getBBox().x2 > this.layers.grid.getBBox().width) {
					$upper_text.remove()
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
					? date_utils.format(date, 'D MMM', this.options.language)
					: '',
			'Half Day_upper':
				date.getDate() !== last_date.getDate()
					? date.getMonth() !== last_date.getMonth()
						? date_utils.format(date, 'D MMM', this.options.language)
						: date_utils.format(date, 'D ddd', this.options.language)
					: '',
			Day_upper:
				date.getMonth() !== last_date.getMonth()
					? date_utils.format(date, 'MMMM', this.options.language)
					: '',
			Week_upper:
				date.getMonth() !== last_date.getMonth()
					? date_utils.format(
							date,
							`MMMM${i < 5 || date.getMonth() === 0 ? ' YYYY' : ''}`,
							this.options.language
					  )
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
			x: i * this.options.column_width,
			lower_y: this.options.header_height,
			upper_y: this.options.header_height - 25,
		}

		const x_pos = {
			Hour_lower: 0,
			Hour_upper: (this.options.column_width * 24) / 2,
			'Quarter Day_lower': 0,
			'Quarter Day_upper': (this.options.column_width * 4) / 2,
			'Half Day_lower': 0,
			'Half Day_upper': (this.options.column_width * 2) / 2,
			Day_lower: this.options.column_width / 2,
			Day_upper: (this.options.column_width * 30) / 2,
			Week_lower: 0,
			Week_upper: (this.options.column_width * 4) / 2,
			Month_lower: this.options.column_width / 2,
			Month_upper:
				(this.options.column_width * monthPerYears[date.getFullYear()]) / 2,
			Year_lower: this.options.column_width / 2,
			Year_upper: (this.options.column_width * 30) / 2,
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
			(hours_before_first_task / this.options.step) *
				this.options.column_width -
			this.options.column_width

		parent_element.scrollLeft = scroll_pos
	}

	bind_grid_click() {
		$.on(
			this.$svg,
			this.options.popup_trigger,
			['.grid-row, .grid-header', '.weekend-highlight', '.past-days-highlight'],
			() => {
				this.unselect_all()
				this.hide_popup()
			}
		)
	}

	bind_bar_events() {
		if (this.options.readonly) return

		if (!this.options.draggable) {
			this.bind_bar_progress()

			return
		}

		let is_dragging = false
		let x_on_start = this.resource_width || 0
		let x_on_scroll_start = 0
		let y_on_start = 0
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

			// use clientX and Y offset doesn't work properly in firefox
			x_on_start = e.clientX
			y_on_start = e.clientY

			parent_bar_id = bar_wrapper.getAttribute('data-id')

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

			// use clientX and Y offset doesn't work properly in firefox
			const dx = e.clientX - x_on_start
			const dy = e.clientY - y_on_start

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
				} else if (is_dragging && this.options.is_draggable) {
					bar.update_bar_position({ x: $bar.ox + $bar.finaldx })
				}
			})
		})

		document.addEventListener('mouseup', e => {
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

			Array.prototype.forEach.call(elements, function (el, i) {
				ids.push(el.getAttribute('data-id'))
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
			}
		})

		$.on(this.$svg, 'mouseup', e => {
			this.bar_being_dragged = null

			bars.forEach(bar => {
				const $bar = bar.$bar

				if (!$bar.finaldx) return

				// reset value, otherwise event fires multiple times
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

			const id = element.getAttribute('data-id')

			const bar = this.get_bar(id)

			const grid_row_width = this.resource_grid_row.getWidth()

			const left = bar.x - (grid_row_width + 50)

			this.$container.scrollTo(left, this.$container.scrollTop)
		})

		$.on(
			this.$svg,
			'click',
			['.resource-text.-team', '.resource-text.-sub-group'],
			(event, element) => {
				console.log('TESTE')
			}
		)

		if (this.options.resource_resize_enable) {
			$.on(this.$svg, 'mousedown', '.resource-resize', (e, handle) => {
				is_resizing = true
				x_on_start = e.clientX

				$resource_resize = this.resource_resize
				$resource_resize.owidth = this.resource_resize.getWidth()
				$resource_resize.ox = this.resource_resize.getX()
			})

			$.on(this.$svg, 'mousemove', e => {
				if (!is_resizing) return

				let dx = e.clientX - x_on_start

				const posX = $resource_resize.ox + dx

				if (
					!posX ||
					isNaN(posX) ||
					posX <= this.resource_width ||
					posX >= this.resource_width + 180
				) {
					return
				}

				this.resource_resize.setAttribute('x', posX)
				this.resource_line.setAttribute('x', posX + 8)
				this.resource_grid_row.setAttribute('width', posX + 8)
				this.resource_header_text.setAttribute('width', posX + 8)
				this.resource_grid_header_line.setAttribute('x2', posX + 8)
				this.resource_grid_layer.forEach(x => {
					x.setAttribute('width', posX + 8)
				})
				this.resource_line_grid_layer.forEach(x => {
					x.setAttribute('width', posX + 8)
				})

				this.resource_item_title_list.forEach(x => {
					const { element, padding, name } = x

					element.setAttribute('width', posX + 8)

					this.text_ellipsis(element, name, posX - padding)
				})
			})

			$.on(this.$svg, 'mouseup', () => {
				is_resizing = false
			})
		}
	}

	bind_bar_progress() {
		let x_on_start = this.resource_width || 0
		let y_on_start = 0
		let is_resizing = null
		let bar = null
		let $bar_progress = null
		let $bar = null

		$.on(this.$svg, 'mousedown', '.handle.progress', (e, handle) => {
			is_resizing = true

			// use clientX and Y offset doesn't work properly in firefox
			x_on_start = e.clientX
			y_on_start = e.clientY

			const $bar_wrapper = $.closest('.bar-wrapper', handle)
			const id = $bar_wrapper.getAttribute('data-id')

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

			// use clientX and Y offset doesn't work properly in firefox
			let dx = e.clientX - x_on_start
			let dy = e.clientY - y_on_start

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

			// reset value, otherwise event fires multiple times
			$bar_progress.finaldx = 0

			bar.progress_changed()
			bar.set_action_completed()
		})
	}

	get_all_dependent_tasks(task_id) {
		let out = []
		let to_process = [task_id]

		while (to_process.length) {
			const deps = to_process.reduce((acc, curr) => {
				acc = acc.concat(this.dependency_map[curr])
				return acc
			}, [])

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
			rem = dx % (this.options.column_width / 7)
			position =
				odx -
				rem +
				(rem < this.options.column_width / 14
					? 0
					: this.options.column_width / 7)
		} else if (this.view_is(VIEW_MODE.MONTH)) {
			rem = dx % (this.options.column_width / 30)
			position =
				odx -
				rem +
				(rem < this.options.column_width / 60
					? 0
					: this.options.column_width / 30)
		} else {
			rem = dx % this.options.column_width
			position =
				odx -
				rem +
				(rem < this.options.column_width / 2 ? 0 : this.options.column_width)
		}

		return position
	}

	unselect_all() {
		;[...this.$svg.querySelectorAll('.bar-wrapper')].forEach(el => {
			el.classList.remove('active')
		})
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
		if (this.tasks.length == 0) return this.gantt_start

		return this.tasks
			.map(task => task._start)
			.reduce((prev_date, cur_date) =>
				cur_date <= prev_date ? cur_date : prev_date
			)
	}

	clear() {
		this.$svg.innerHTML = ''
	}

	generate_id(task) {
		return task.name + '_' + Math.random().toString(36).slice(2, 12)
	}
}
