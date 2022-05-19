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
];

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth();
const getDate = (day) => `${year}-${month + 1}-${day}`;

const workitems = [
    {
        start: getDate(1),
        end: getDate(8),
        name: 'Lorem ipsum dolor sit amet',
        id: 'Task 0',
        type_id: 'hotfix',
        responsable_id: 2,
        progress: 20,
    },
    {
        start: getDate(3),
        end: getDate(6),
        name: 'Nulla aliquam egestas velit posuere commodo',
        id: 'Task 1',
        type_id: 'task',
        responsable_id: 1,
        progress: 5,
        dependencies: 'Task 0',
    },
    {
        start: getDate(4),
        end: getDate(8),
        name: 'Duis nec ornare massa. Vestibulum at consectetur arcu',
        id: 'Task 2',
        type_id: 'task',
        responsable_id: 1,
        progress: 10,
        dependencies: 'Task 1',
    },
    {
        start: getDate(8),
        end: getDate(9),
        name: 'Aenean maximus, odio sed rhoncus vulputate',
        id: 'Task 3',
        type_id: 'debit',
        progress: 5,
        dependencies: 'Task 2',
        custom_class: 'bar-milestone',
    },
    {
        start: getDate(8),
        end: getDate(10),
        name: 'Curabitur venenatis ac lorem sed imperdiet',
        id: 'Task 4',
        type_id: 'debit',
        responsable_id: 1,
        progress: 0,
        dependencies: 'Task 2',
    },
    {
        start: getDate(11),
        duration: 2,
        name: 'Quisque porta justo fringilla quam euismod, eu semper libero viverra',
        id: 'Task 5',
        type_id: 'debit',
        progress: 0,
        dependencies: 'Task 4',
        custom_class: 'bar-milestone',
    },
    {
        start: getDate(11),
        end: getDate(16),
        name: 'Maecenas augue nulla, luctus id rutrum at, efficitur id quam!',
        id: 'Task_6',
        type_id: 'epic',
        responsable_id: 1,
        progress: 0,
        dependencies: '',
        custom_class: 'bar-milestone',
        thumbnail:
            'https://www.clipartmax.com/png/middle/85-851687_campfire-icon-14-icon-success-error.png',
    },
    {
        start: getDate(11),
        end: getDate(18),
        name: 'Etiam at suscipit ipsum, sollicitudin efficitur purus',
        id: 'Task_7',
        responsable_id: 1,
        progress: 0,
        dependencies: 'Task_0',
        custom_class: 'bar-milestone',
        thumbnail:
            'https://image.similarpng.com/very-thumbnail/2021/06/Attention-sign-icon.png',
    },
    {
        start: getDate(3),
        duration: 2,
        name: 'Ut at mi dictum, bibendum augue quis, sagittis nisi',
        id: 'Task 9',
        type_id: 'debit',
        progress: 10,
    },
    {
        start: getDate(5),
        duration: 3,
        name: 'Cras eget ornare leo, non congue leo. Aenean porttitor rutrum enim tincidunt rutrum',
        id: 'Task 10',
        type_id: 'debit',
        progress: 0,
    },
    {
        start: getDate(8),
        duration: 2,
        name: 'Proin id faucibus massa',
        id: 'Task 11',
        type_id: 'hotfix',
        progress: 0,
    },
    {
        start: getDate(15),
        duration: 5,
        name: 'Nam condimentum nisl in diam molestie',
        id: 'Task 12',
        type_id: 'hotfix',
        progress: 0,
    },
    {
        start: getDate(1),
        duration: 6,
        name: 'Quisque ac neque pulvinar, ullamcorper lorem at, vestibulum lectus',
        id: 'Task 13',
        type_id: 'task',
        progress: 50,
    },
];

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
];

const options = {
    on_click: function (workitem) {
        console.log('on_click', workitem);
    },
    on_dblclick: function (workitem) {
        console.log('dblclick', workitem);
    },
    on_date_change: function (workitem, start, end) {
        console.log('on_date_change', workitem, start, end);
    },
    on_progress_change: function (workitem, progress) {
        console.log('on_progress_change', workitem, progress);
    },
    on_view_change: function (mode) {
        console.log('on_view_change', mode);
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
    handle_bar_color: '#752f00',
    handle_progress_color: '#752f00',
    resource_resize_enable: true,
    resource_fixed: true,
    resource_enable: true,
    resource_title: 'Tarefas',
    resource_width: 250,
    responsables_enable: true,
    responsables_sort_by: 'name', // 'default' - 'name'
    responsables_default_name: 'Não atribuido',
    responsables_default_photo: './images-example/responsable-default.png',
    rows_alternate_background: true,
    grid_ticks: false,
};

const gantt = new Gantt(
    '.gantt-target',
    workitems,
    workItemTypes,
    responsables,
    options
);
