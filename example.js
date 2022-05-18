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

const workitems = [
    {
        start: '2018-10-01',
        end: '2018-10-08',
        name: 'Lorem ipsum dolor sit amet',
        id: 'Task 0',
        type_id: 'hotfix',
        responsable_id: 2,
        progress: 20,
    },
    {
        start: '2018-10-03',
        end: '2018-10-06',
        name: 'Nulla aliquam egestas velit posuere commodo',
        id: 'Task 1',
        type_id: 'task',
        responsable_id: 1,
        progress: 5,
        dependencies: 'Task 0',
    },
    {
        start: '2018-10-04',
        end: '2018-10-08',
        name: 'Duis nec ornare massa. Vestibulum at consectetur arcu',
        id: 'Task 2',
        type_id: 'task',
        responsable_id: 1,
        progress: 10,
        dependencies: 'Task 1',
    },
    {
        start: '2018-10-08',
        end: '2018-10-09',
        name: 'Aenean maximus, odio sed rhoncus vulputate',
        id: 'Task 3',
        type_id: 'debit',
        progress: 5,
        dependencies: 'Task 2',
        custom_class: 'bar-milestone',
    },
    {
        start: '2018-10-08',
        end: '2018-10-10',
        name: 'Curabitur venenatis ac lorem sed imperdiet',
        id: 'Task 4',
        type_id: 'debit',
        responsable_id: 1,
        progress: 0,
        dependencies: 'Task 2',
    },
    {
        start: '2018-10-11',
        //end: '2018-10-11',
        duration: 2,
        name: 'Quisque porta justo fringilla quam euismod, eu semper libero viverra',
        id: 'Task 5',
        type_id: 'debit',
        progress: 0,
        dependencies: 'Task 4',
        custom_class: 'bar-milestone',
    },
    {
        start: '2018-10-11',
        end: '2018-10-25',
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
        start: '2018-10-11',
        end: '2018-10-20',
        name: 'Etiam at suscipit ipsum, sollicitudin efficitur purus',
        id: 'Task_7',
        responsable_id: 1,
        progress: 0,
        dependencies: 'Task_0',
        custom_class: 'bar-milestone',
        thumbnail:
            'https://image.similarpng.com/very-thumbnail/2021/06/Attention-sign-icon.png',
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
    language: 'en',
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
    resource_resize_enable: true,
    resource_fixed: true,
    resource_enable: true,
    resource_title: 'Tarefas',
    resource_width: 250,
    responsables_enable: true,
    responsables_sort_by: 'name', // 'default' - 'name'
    responsables_default_name: 'Não atribuido',
    responsables_default_photo: './images-example/responsable-default.png',
};

const gantt = new Gantt(
    '.gantt-target',
    workitems,
    workItemTypes,
    responsables,
    options
);
