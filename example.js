const responsables = [
	{
		id: 1,
		name: 'José Santos Oliveira Rodrigues',
		photo: './images-example/responsable-1.jpg',
	},
	{
		id: 2,
		name: 'Roberta Souza de Melo',
		photo: './images-example/responsable-default.png',
	},
]

const teams = [
	{
		name: 'Suporte',
		id: 1,
		slug: 'SU',
		color: '#e27d02',
		icon: './images-example/icon-1.png',
	},
	{
		name: 'Implantação',
		id: 2,
		slug: 'IM',
		icon: './images-example/icon-2.png',
	},
	{
		name: 'Produto',
		id: 3,
		slug: 'PR',
		color: '#d81e46',
		icon: './images-example/icon-3.png',
	},
	{
		name: 'Tecnologia',
		id: 4,
		slug: 'TE',
		color: '#e27dff',
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
		id: '0',
		type_id: 'hotfix',
		progress: 20,
		estimated: 100,
		bar_color: '#E2445C',
	},
	{
		start: getDate(3),
		end: getDate(6),
		name: 'Nulla aliquam egestas velit posuere commodo',
		id: '1',
		type_id: 'task',
		progress: 5,
		estimated: 100,
		bar_color: '#FDAB3D',
		dependencies: '0',
	},
	{
		start: getDate(4),
		end: getDate(8),
		name: 'Duis nec ornare massa. Vestibulum at consectetur arcu',
		id: '2',
		type_id: 'task',
		progress: 10,
		estimated: 100,
		dependencies: '1',
		bar_color: '#FDAB3D',
	},
	{
		start: getDate(8),
		end: getDate(9),
		name: 'Aenean maximus, odio sed rhoncus vulputate',
		id: '3',
		type_id: 'debit',
		progress: 5,
		estimated: 100,
		dependencies: '2',
		bar_color: '#579BFC',
	},
	{
		start: getDate(8),
		end: getDate(10),
		name: 'Curabitur venenatis ac lorem sed imperdiet',
		id: '4',
		type_id: 'debit',
		bar_color: '#FDAB3D',
		progress: 0,
		estimated: 100,
		dependencies: '2',
	},
	{
		start: getDate(11),
		duration: 2,
		name: 'Quisque porta justo fringilla quam euismod, eu semper libero viverra',
		id: '5',
		type_id: 'debit',
		progress: 0,
		estimated: 100,
		dependencies: '4',
		bar_color: '#579BFC',
	},
	{
		start: getDate(11),
		end: getDate(16),
		name: 'Maecenas augue nulla, luctus id rutrum at, efficitur id quam!',
		id: '6',
		type_id: 'epic',
		progress: 20,
		estimated: 100,
		dependencies: '',
		bar_color: '#9CD326',
		thumbnail:
			'https://www.clipartmax.com/png/middle/85-851687_campfire-icon-14-icon-success-error.png',
	},
	{
		start: getDate(11),
		end: getDate(18),
		name: 'Etiam at suscipit ipsum, sollicitudin efficitur purus',
		id: '7',
		progress: 0,
		estimated: 100,
		dependencies: '0',
		bar_color: '#E2445C',
		thumbnail:
			'https://image.similarpng.com/very-thumbnail/2021/06/Attention-sign-icon.png',
	},
	{
		start: getDate(3),
		duration: 2,
		name: 'Ut at mi dictum, bibendum augue quis, sagittis nisi',
		id: '9',
		type_id: 'debit',
		bar_color: '#579BFC',
		progress: 10,
		estimated: 100,
	},
	{
		start: getDate(5),
		duration: 3,
		name: 'Cras eget ornare leo, non congue leo. Aenean porttitor rutrum enim tincidunt rutrum',
		id: '10',
		type_id: 'debit',
		progress: 40,
		estimated: 100,
	},
	{
		start: getDate(8),
		duration: 2,
		name: 'Proin id faucibus massa',
		id: '11',
		type_id: 'hotfix',
		bar_color: '#E2445C',
		progress: 0,
		estimated: 100,
	},
	{
		start: getDate(15),
		duration: 5,
		name: 'Nam condimentum nisl in diam molestie',
		id: '12',
		type_id: 'hotfix',
		bar_color: '#E2445C',
		progress: 0,
		estimated: 100,
	},
	{
		start: getDate(1),
		duration: 6,
		name: 'Quisque ac neque pulvinar, ullamcorper lorem at, vestibulum lectus',
		id: '13',
		type_id: 'task',
		bar_color: '#FDAB3D',
		progress: 50,
		estimated: 100,
	},
]

workitems.forEach(wi => {
	wi.team_id = parseInt(Math.random() * (teams.length - 0), 10)

	wi.responsable_id = parseInt(
		Math.random() * (responsables.length + 1 - 0),
		10
	)

	if (wi.responsable_id > responsables.length) wi.responsable_id = undefined
})

const workItemTypes = [
	{
		id: 'hotfix',
		name: 'Hotfix',
		bar_class: 'bar-hotfix',
		color: '#e27d02',
		icon: './images-example/icon-1.png',
	},
	{
		id: 'task',
		name: 'Task',
		bar_class: 'bar-task',
		color: '#0758b3',
		icon: './images-example/icon-2.png',
	},
	{
		id: 'debit',
		name: 'Débito Técnico',
		bar_class: 'bar-debit',
		icon: './images-example/icon-3.png',
	},
	{
		id: 'epic',
		name: 'Épico',
		bar_class: 'bar-epic',
		color: '#d81e46',
	},
]

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
	readonly: false,
	draggable: true,
	hasArrows: true,
	move_dependent: 'both',
	fixed_label_location: false,
	hide_labels: true,
	horizontal_auto_scroll_labels: false,
	is_draggable: true,
	bar_height: 22,
	handle_bar_color: '#333',
	handle_progress_color: '#333',
	resource_resize_enable: true,
	resource_fixed: true,
	resource_enable: true,
	resource_title: 'Tarefas',
	resource_width: 280,
	responsables_enable: true,
	responsables_sort_by: 'name', // 'default' - 'name'
	responsables_default_name: 'Não atribuido',
	responsables_default_photo: './images-example/responsable-default.png',
	teams_enable: true,
	teams_sort_by: 'name', // 'default' - 'name'
	rows_alternate_background: false,
	grid_ticks: false,
	bar_color_default: '#FFCC33',
	highlights_weekend: true,
	highlights_past_days: true,
	link_detail_text: 'Ver detalhes',
}

const gantt = new Gantt(
	'.gantt-target',
	workitems,
	workItemTypes,
	responsables,
	teams,
	options
)
