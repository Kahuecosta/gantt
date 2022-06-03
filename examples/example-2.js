/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

const responsables = [
	{
		id: 1,
		name: 'José Santos Oliveira Rodrigues',
		photo: './images/responsable-1.jpg',
	},
	{
		id: 2,
		name: 'Roberta Souza de Melo',
		photo: './images/responsable-default.png',
	},
]

const groups = [
	{
		name: 'Agiboard V2',
		id: 1,
		color: '#e27d02',
		icon: './images/icon-1.png',
		sub_group: [
			{
				name: 'A fazer',
				id: 1,
				color: '#e27d02',
				icon: './images/icon-1.png',
			},
			{
				name: 'Prioridade',
				id: 2,
				color: '#e27d02',
			},
			{
				name: 'Em avaliação',
				id: 3,
			},
			{
				name: 'Fazendo',
				id: 4,
				color: '#d81e46',
			},
			{
				name: 'Feito',
				id: 5,
				icon: './images/icon-3.png',
			},
		],
	},
	{
		name: 'Implantação',
		id: 2,
	},
	{
		name: 'Produto',
		id: 3,
		color: '#d81e46',
		icon: './images/icon-3.png',
	},
	{
		name: 'Tecnologia',
		id: 4,
		color: '#e27dff',
	},
]

const types = [
	{
		id: 1,
		name: 'Hotfix',
		bar_class: 'bar-hotfix',
		color: '#e27d02',
		fontIcon: 'fa-map',
	},
	{
		id: 2,
		name: 'Task',
		bar_class: 'bar-task',
		color: '#0758b3',
		imageIcon: './images/icon-2.png',
	},
	{
		id: 3,
		name: 'Débito Técnico',
		bar_class: 'bar-debit',
		imageIcon: './images/icon-3.png',
	},
	{
		id: 4,
		name: 'Épico',
		bar_class: 'bar-epic',
		color: '#d81e46',
	},
]

const workitems = [
	{
		bar_color: '#E2445C',
		dependencies: [],
		end: '2022-5-8',
		group_id: 2,
		id: '1',
		name: 'Lorem ipsum dolor sit amet',
		progress: 20,
		responsable_id: 1,
		start: '2022-5-1',
		type_id: 2,
	},
	{
		bar_color: '#FDAB3D',
		dependencies: [6],
		end: '2022-5-6',
		group_id: 0,
		id: '2',
		name: 'Nulla aliquam egestas velit posuere commodo',
		progress: 5,
		responsable_id: 1,
		start: '2022-5-3',
		type_id: 3,
	},
	{
		bar_color: '#FDAB3D',
		dependencies: [],
		end: '2022-5-8',
		group_id: 0,
		id: '3',
		name: 'Duis nec ornare massa. Vestibulum at consectetur arcu',
		progress: 10,
		responsable_id: 0,
		start: '2022-5-4',
		type_id: 0,
	},
	{
		bar_color: '#579BFC',
		dependencies: [],
		end: '2022-5-9',
		group_id: 1,
		id: '4',
		name: 'Aenean maximus, odio sed rhoncus vulputate',
		progress: 5,
		responsable_id: 0,
		start: '2022-5-8',
		sub_group_id: 4,
		type_id: 2,
	},
	{
		bar_color: '#FDAB3D',
		dependencies: [9],
		end: '2022-5-10',
		group_id: 1,
		id: '5',
		name: 'Curabitur venenatis ac lorem sed imperdiet',
		progress: 0,
		responsable_id: 2,
		start: '2022-5-8',
		sub_group_id: 3,
		type_id: 3,
	},
	{
		bar_color: '#579BFC',
		dependencies: [7],
		duration: 2,
		group_id: 1,
		id: '6',
		name: 'Quisque porta justo fringilla quam euismod, eu semper libero viverra',
		progress: 0,
		responsable_id: 0,
		start: '2022-5-11',
		sub_group_id: 1,
		type_id: 0,
	},
	{
		bar_color: '#9CD326',
		dependencies: [],
		end: '2022-5-16',
		group_id: 4,
		id: '7',
		name: 'Maecenas augue nulla, luctus id rutrum at, efficitur id quam!',
		progress: 20,
		responsable_id: 0,
		start: '2022-5-11',
		thumbnail:
			'https://www.clipartmax.com/png/middle/85-851687_campfire-icon-14-icon-success-error.png',
		type_id: 1,
	},
	{
		bar_color: '#E2445C',
		dependencies: [],
		end: '2022-5-18',
		group_id: 3,
		id: '8',
		name: 'Etiam at suscipit ipsum, sollicitudin efficitur purus',
		progress: 0,
		responsable_id: 1,
		start: '2022-5-11',
		thumbnail:
			'https://image.similarpng.com/very-thumbnail/2021/06/Attention-sign-icon.png',
		type_id: 4,
	},
	{
		bar_color: '#579BFC',
		dependencies: [10],
		duration: 2,
		group_id: 4,
		id: '9',
		name: 'Ut at mi dictum, bibendum augue quis, sagittis nisi',
		progress: 10,
		responsable_id: 2,
		start: '2022-5-3',
		type_id: 2,
	},
	{
		dependencies: [],
		duration: 3,
		group_id: 3,
		id: '10',
		name: 'Cras eget ornare leo, non congue leo. Aenean porttitor rutrum enim tincidunt rutrum',
		progress: 40,
		responsable_id: 2,
		start: '2022-5-5',
		type_id: 1,
	},
	{
		bar_color: '#E2445C',
		dependencies: [],
		duration: 2,
		group_id: 2,
		id: '11',
		name: 'Proin id faucibus massa',
		progress: 0,
		responsable_id: 1,
		start: '2022-5-8',
		type_id: 0,
	},
	{
		bar_color: '#E2445C',
		dependencies: [],
		duration: 5,
		group_id: 1,
		id: '12',
		name: 'Nam condimentum nisl in diam molestie',
		progress: 0,
		responsable_id: 0,
		start: '2022-5-15',
		sub_group_id: 1,
		type_id: 2,
	},
	{
		bar_color: '#FDAB3D',
		dependencies: [],
		duration: 6,
		group_id: 3,
		id: '13',
		name: 'Quisque ac neque pulvinar, ullamcorper lorem at, vestibulum lectus',
		progress: 50,
		responsable_id: 2,
		start: '2023-5-1',
		type_id: 4,
	},
]

const tooltips = document.createElement('div')
tooltips.style.display = 'none'
document.body.appendChild(tooltips)

workitems.forEach(wi => {
	const tooltip = document.createElement('div')
	tooltip.setAttribute('data-gantt-tooltip-id', wi.id)
	tooltip.innerHTML = `<<<<< ${wi.id} >>>>>><br><br><br><br>`
	tooltips.appendChild(tooltip)
})

const options = {
	on_click: function (workitem) {
		console.log('on_click', workitem)
	},
	on_dblclick: function (workitem) {
		console.log('dblclick', workitem)
	},
	on_date_change: function (workitem, start, end) {
		console.log('on_date_change', workitem, start, end)
	},
	on_progress_change: function (workitem, progress) {
		console.log('on_progress_change', workitem, progress)
	},
	on_view_change: function (mode) {
		console.log('on_view_change', mode)
	},
	on_link_open_detail: function (id) {
		console.log('on_link_open_detail', id)
	},
	view_mode: 'Day',
	language: 'pt-br',
	margin_bottom: -26,
	disallow_popup: false,
	arrow_curve: 15,
	readonly: false,
	draggable_bar_handles: true,
	hasArrows: true,
	move_dependent: 'both',
	fixed_label_location: false,
	hide_labels: false,
	horizontal_auto_scroll_labels: false,
	draggable_bar: true,
	bar_height: 22,
	handle_bar_color: '#333',
	handle_progress_color: '#333',
	resource_resize_enable: true,
	resource_fixed: true,
	resource_enable: true,
	resource_collapse_enable: true,
	resource_title: 'Desenvolvimento Evolutivo',
	resource_width: 350,
	responsables_enable: true,
	responsables_sort_by: 'name',
	responsables_default_name: 'Não atribuido',
	responsables_default_photo: './images/responsable-default.png',
	groups_enable: true,
	groups_sort_by: 'name',
	workitems_sort_by: 'name',
	workitems_custom_tooltip: true,
	workitems_click_tooltip_open_detail: true,
	rows_alternate_background: false,
	grid_ticks: true,
	bar_color_default: '#FFCC33',
	highlights_weekend: true,
	highlights_past_days: true,
	link_detail_text: 'Ver detalhes',
	dir_assets: '../dist/assets',
	zoom_max: 5,
}

let gantt

const reload = () => {
	document.getElementsByClassName('gantt-container')[0].remove()

	init()
}

const init = () => {
	gantt = new Gantt(
		'.gantt-target',
		workitems,
		types,
		responsables,
		groups,
		options
	)
}

init()
