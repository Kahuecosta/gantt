const workitems = [
    {
        start: '2018-10-01',
        end: '2018-10-08',
        name: 'Redesign website',
        id: 'Task 0',
        group_id: 'design',
        progress: 20,
    },
    {
        start: '2018-10-03',
        end: '2018-10-06',
        name: 'Write new content',
        id: 'Task 1',
        group_id: 'development',
        progress: 5,
        dependencies: 'Task 0',
    },
    {
        start: '2018-10-04',
        end: '2018-10-08',
        name: 'Apply new styles',
        id: 'Task 2',
        group_id: 'development',
        progress: 10,
        dependencies: 'Task 1',
    },
    {
        start: '2018-10-08',
        end: '2018-10-09',
        name: 'Review',
        id: 'Task 3',
        group_id: 'integration',
        progress: 5,
        dependencies: 'Task 2',
        custom_class: 'bar-milestone',
    },
    {
        start: '2018-10-08',
        end: '2018-10-10',
        name: 'Deploy',
        id: 'Task 4',
        group_id: 'integration',
        progress: 0,
        dependencies: 'Task 2',
    },
    {
        start: '2018-10-11',
        //end: '2018-10-11',
        duration: 2,
        name: 'Go Live!',
        id: 'Task 5',
        group_id: 'integration',
        progress: 0,
        dependencies: 'Task 4',
        custom_class: 'bar-milestone',
    },
    {
        start: '2018-10-11',
        end: '2018-10-25',
        name: 'Header Stick!',
        id: 'Task_6',
        group_id: 'integration',
        progress: 0,
        dependencies: '',
        custom_class: 'bar-milestone',
        thumbnail:
            'https://www.clipartmax.com/png/middle/85-851687_campfire-icon-14-icon-success-error.png',
    },
    {
        start: '2018-10-11',
        end: '2018-10-20',
        name: 'Jean Jacques doc!',
        id: 'Task_7',
        group_id: 'integration',
        progress: 0,
        dependencies: 'Task_0',
        custom_class: 'bar-milestone',
        thumbnail:
            'https://image.similarpng.com/very-thumbnail/2021/06/Attention-sign-icon.png',
    },
];

const gantt = new Gantt('.gantt-target', workitems, {
    on_click: function (task) {
        console.log('on_click', task);
    },
    on_dblclick: function (task) {
        console.log('dblclick', task);
    },
    on_date_change: function (task, start, end) {
        console.log('on_date_change', task, start, end);
    },
    on_progress_change: function (task, progress) {
        console.log('on_progress_change', task, progress);
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
    hide_labels: false,
    is_draggable: true,
    bar_height: 22,
    resource_enable: true,
    resource_title: 'Tarefas',
    resource_width: 250,
    groups: [
        {
            id: 'design',
            name: 'Web Design',
            bar_class: 'bar-design',
        },
        {
            id: 'development',
            name: 'Development',
            bar_class: 'bar-development',
        },
        {
            id: 'integration',
            name: 'Integration & Deployment',
            bar_class: 'bar-integration',
        },
    ],
});

console.log(gantt);
