<div align="center">
    <h2 align="center">Frappe Gantt customized</h2>
    <p>A simple, interactive, modern gantt chart library for the web</p>
    <img src="./gantt v1.0.png" />
    <br /><br />
</div>

<div align="center">
    <h4>Frappe Gantt</h4>
    <p align="center"> 
        <a href="https://frappe.github.io/gantt">
            <b>View the demo (frappe version) »</b>
        </a>
    </p>
    <a href="https://frappe.github.io/gantt">
        <img src="https://cloud.githubusercontent.com/assets/9355208/21537921/4a38b194-cdbd-11e6-8110-e0da19678a6d.png">
    </a>
     <br /><br /><br /><br />
</div>

### Install (my version)

```
npm install github.com/Kahuecosta/gantt
```

### Install (frappe version)

```
npm install frappe-gantt
```

### Usage

Include it in your HTML:

```
<script src="frappe-gantt.min.js"></script>
<link rel="stylesheet" href="frappe-gantt.css">
```

And start hacking:

```js
const responsables = [
    {
        id: 1,
        name: 'Kahuê Costa',
        photo: './images-example/responsable-1.jpg',
    },
    {
        id: 2,
        name: 'João Silva',
        photo: './images-example/responsable-default.png',
    },
];

const workitems = [
  {
    id: 'Task 1',
    name: 'Redesign website',
    start: '2016-12-28',
    end: '2016-12-31',
    responsable_id: 1,
    progress: 20,
    dependencies: 'Task 2, Task 3',
    custom_class: 'bar-milestone' // optional
  },
  ...
];

const workItemTypes = [
    {
        id: 'design',
        name: 'Web Design',
        bar_class: 'bar-design',
        color: '#e27d02',
    },
];

const gantt = new Gantt("#gantt", workitems, workItemTypes, responsables);
```

You can also pass various options to the Gantt constructor:

```js
const options = {
    header_height: 50,
    column_width: 30,
    step: 24,
    view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
    bar_height: 20,
    bar_corner_radius: 3,
    arrow_curve: 5,
    padding: 18,
    view_mode: 'Day', // 'Quarter Day' - 'Half Day' - 'Day' - 'Week' - 'Month' - 'Year'
    padding_start: null, // view_mode: 'Day' => padding_start in days
    padding_end: null, // view_mode: 'Day' => padding_end in days
    date_format: 'YYYY-MM-DD',
    popup_trigger: 'click',
    custom_popup_html: null,
    language: 'en',
    margin_bottom: 100,
    disallow_popup: false,
    readonly: false,
    draggable: true,
    hasArrows: true,
    move_dependent: 'right', // 'left' - 'right' - 'both'
    fixed_label_location: false,
    hide_labels: false,
    horizontal_auto_scroll_labels: false,
    is_draggable: true,
    handle_bar_color: '#752f00',
    handle_progress_color: '#752f00',
    resource_resize_enable: true,
    resource_fixed: true,
    resource_enable: true,
    resource_title: 'Tasks',
    resource_width: 250,
    responsables_enable: true,
    responsables_sort_by: 'default', // 'default' - 'name'
    responsables_default_name: 'Não atribuido',
    responsables_default_photo: './images-example/responsable-default.png',
    rows_alternate_background: false,
    grid_ticks: true,
};

const gantt = new Gantt(
    '#gantt',
    workitems,
    workItemTypes,
    responsables,
    options
);
```

### Contributing

If you want to contribute enhancements or fixes:

1. Clone this repo.
2. `cd` into project directory
3. `yarn`
4. `yarn run dev`
5. Open `index.html` in your browser, make your code changes and test them.

### Publishing

If you have publishing rights (Frappe Team), follow these steps to publish a new version.

Assuming the last commit (or a couple of commits) were enhancements or fixes,

1. Run `yarn build`

    This will generate files in the `dist/` folder. These files need to be committed.

1. Run `yarn publish`
1. Type the new version at the prompt

    Depending on the type of change, you can either bump the patch version or the minor version.
    For e.g.,

    ```
    0.5.0 -> 0.6.0 (minor version bump)
    0.5.0 -> 0.5.1 (patch version bump)
    ```

1. Now, there will be a commit named after the version you just entered. Include the generated files in `dist/` folder as part of this commit by running the command:
    ```
    git add dist
    git commit --amend
    git push origin master
    ```

License: MIT

---

Project maintained by [frappe](https://github.com/frappe)
