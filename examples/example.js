const responsables = [
	{
		id: 1,
		name: 'José Santos Oliveira Rodrigues',
		photo: './examples/images/responsable-1.jpg',
	},
	{
		id: 2,
		name: 'Roberta Souza de Melo',
		photo: './examples/images/responsable-default.png',
	},
]

const groups = [
	{
		name: 'Agiboard V2',
		id: 1,
		color: '#e27d02',
		icon: './examples/images/icon-1.png',
		sub_group: [
			{
				name: 'A fazer',
				id: 1,
				color: '#e27d02',
				icon: './examples/images/icon-1.png',
			},
			{
				name: 'Prioridade',
				id: 2,
				color: '#e27d02',
			},
			{
				name: 'Em avaliação',
				id: 3,
				icon: './examples/images/icon-2.png',
			},
			{
				name: 'Fazendo',
				id: 4,
				color: '#d81e46',
			},
			{
				name: 'Feito',
				id: 5,
				icon: './examples/images/icon-3.png',
			},
		],
	},
	{
		name: 'Implantação',
		id: 2,
		icon: './examples/images/icon-2.png',
	},
	{
		name: 'Produto',
		id: 3,
		color: '#d81e46',
		icon: './examples/images/icon-3.png',
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
		icon: './examples/images/icon-1.png',
	},
	{
		id: 2,
		name: 'Task',
		bar_class: 'bar-task',
		color: '#0758b3',
		icon: './examples/images/icon-2.png',
	},
	{
		id: 3,
		name: 'Débito Técnico',
		bar_class: 'bar-debit',
		icon: './examples/images/icon-3.png',
	},
	{
		id: 4,
		name: 'Épico',
		bar_class: 'bar-epic',
		color: '#d81e46',
	},
]

const date = new Date()
const year = date.getFullYear()
const month = date.getMonth()
const getDate = day => `${year}-${month + 1}-${day}`

const workitems = [
	{
		start: getDate(1),
		end: getDate(8),
		name: 'Lorem ipsum dolor sit amet',
		progress: 20,
		bar_color: '#E2445C',
	},
	{
		start: getDate(3),
		end: getDate(6),
		name: 'Nulla aliquam egestas velit posuere commodo',
		progress: 5,
		bar_color: '#FDAB3D',
	},
	{
		start: getDate(4),
		end: getDate(8),
		name: 'Duis nec ornare massa. Vestibulum at consectetur arcu',
		progress: 10,
		bar_color: '#FDAB3D',
	},
	{
		start: getDate(8),
		end: getDate(9),
		name: 'Aenean maximus, odio sed rhoncus vulputate',
		progress: 5,
		bar_color: '#579BFC',
	},
	{
		start: getDate(8),
		end: getDate(10),
		name: 'Curabitur venenatis ac lorem sed imperdiet',
		bar_color: '#FDAB3D',
		progress: 0,
	},
	{
		start: getDate(11),
		duration: 2,
		name: 'Quisque porta justo fringilla quam euismod, eu semper libero viverra',
		progress: 0,
		bar_color: '#579BFC',
	},
	{
		start: getDate(11),
		end: getDate(16),
		name: 'Maecenas augue nulla, luctus id rutrum at, efficitur id quam!',
		progress: 20,
		bar_color: '#9CD326',
		thumbnail:
			'https://www.clipartmax.com/png/middle/85-851687_campfire-icon-14-icon-success-error.png',
	},
	{
		start: getDate(11),
		end: getDate(18),
		name: 'Etiam at suscipit ipsum, sollicitudin efficitur purus',
		progress: 0,
		bar_color: '#E2445C',
		thumbnail:
			'https://image.similarpng.com/very-thumbnail/2021/06/Attention-sign-icon.png',
	},
	{
		start: getDate(3),
		duration: 2,
		name: 'Ut at mi dictum, bibendum augue quis, sagittis nisi',
		bar_color: '#579BFC',
		progress: 10,
	},
	{
		start: getDate(5),
		duration: 3,
		name: 'Cras eget ornare leo, non congue leo. Aenean porttitor rutrum enim tincidunt rutrum',
		progress: 40,
	},
	{
		start: getDate(8),
		duration: 2,
		name: 'Proin id faucibus massa',
		bar_color: '#E2445C',
		progress: 0,
	},
	{
		start: getDate(15),
		duration: 5,
		name: 'Nam condimentum nisl in diam molestie',
		bar_color: '#E2445C',
		progress: 0,
	},
	{
		start: getDate(1),
		duration: 6,
		name: 'Quisque ac neque pulvinar, ullamcorper lorem at, vestibulum lectus',
		bar_color: '#FDAB3D',
		progress: 50,
	},
]

workitems.forEach((wi, i) => (wi.id = i + 1))

const dependencies = [2, 5, 6, 9]

workitems.forEach(wi => {
	wi.group_id = parseInt(Math.random() * (groups.length + 1), 10)

	wi.type_id = parseInt(Math.random() * (types.length + 1), 10)

	wi.responsable_id = parseInt(Math.random() * (responsables.length + 1), 10)

	if (wi.type_id > types.length) wi.type_id = undefined

	if (wi.responsable_id > responsables.length) wi.responsable_id = undefined

	const w_group = groups.find(t => t.id === wi.group_id)
	if (w_group && w_group.sub_group) {
		wi.sub_group_id = parseInt(Math.random() * w_group.sub_group.length, 10)
	}

	if (dependencies.includes(wi.id)) {
		wi.dependencies = [parseInt(Math.random() * (workitems.length + 1), 10)]
	}
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
	hide_labels: true,
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
	resource_width: 280,
	responsables_enable: true,
	responsables_sort_by: 'name', // 'default' - 'name'
	responsables_default_name: 'Não atribuido',
	responsables_default_photo: './examples/images/responsable-default.png',
	groups_enable: true,
	groups_sort_by: 'name', // 'default' - 'name'
	rows_alternate_background: true,
	grid_ticks: false,
	bar_color_default: '#FFCC33',
	highlights_weekend: true,
	highlights_past_days: true,
	link_detail_text: 'Ver detalhes',
}

const gantt = new Gantt(
	'.gantt-target',
	workitems,
	types,
	responsables,
	groups,
	options
)
