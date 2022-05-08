const workitems = [
    {
        start: '2018-10-01',
        end: '2018-10-08',
        name: 'Criação dos processos de RH do cliente Santa Clara',
        id: 'Task 0',
        type_id: 'hotfix',
        progress: 20,
    },
    {
        start: '2018-10-03',
        end: '2018-10-06',
        name: 'Write new content',
        id: 'Task 1',
        type_id: 'task',
        progress: 5,
        dependencies: 'Task 0',
    },
    {
        start: '2018-10-04',
        end: '2018-10-08',
        name: 'Apply new styles',
        id: 'Task 2',
        type_id: 'task',
        progress: 10,
        dependencies: 'Task 1',
    },
    {
        start: '2018-10-08',
        end: '2018-10-09',
        name: 'Review',
        id: 'Task 3',
        type_id: 'debit',
        progress: 5,
        dependencies: 'Task 2',
        custom_class: 'bar-milestone',
    },
    {
        start: '2018-10-08',
        end: '2018-10-10',
        name: 'Deploy',
        id: 'Task 4',
        type_id: 'debit',
        progress: 0,
        dependencies: 'Task 2',
    },
    {
        start: '2018-10-11',
        //end: '2018-10-11',
        duration: 2,
        name: 'Go Live!',
        id: 'Task 5',
        type_id: 'debit',
        progress: 0,
        dependencies: 'Task 4',
        custom_class: 'bar-milestone',
    },
    {
        start: '2018-10-11',
        end: '2018-10-25',
        name: 'Header Stick!',
        id: 'Task_6',
        type_id: 'epic',
        progress: 0,
        dependencies: '',
        custom_class: 'bar-milestone',
        thumbnail:
            'https://www.clipartmax.com/png/middle/85-851687_campfire-icon-14-icon-success-error.png',
    },
    {
        start: '2018-10-11',
        end: '2018-10-20',
        name: 'Correção no módulo de impresão de PDF',
        id: 'Task_7',
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
        icon: './icons/icon-1.png',
    },
    {
        id: 'task',
        name: 'Task',
        bar_class: 'bar-task',
        color: '#0758b3',
        icon: './icons/icon-2.png',
    },
    {
        id: 'debit',
        name: 'Débito Técnico',
        bar_class: 'bar-debit',
        icon: './icons/icon-3.png',
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
    resource_fixed: true,
    resource_enable: true,
    resource_title: 'Tarefas',
    resource_width: 250,
};

const gantt = new Gantt('.gantt-target', workitems, workItemTypes, options);
