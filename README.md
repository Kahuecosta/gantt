<div align="center">
    <h2 align="center">Simple Gantt</h2>
    <p>A simple, interactive, modern gantt chart library for the web</p>
    <img src="./gantt-1.png" />
		<br /><br />
		<img src="./gantt-2.png" />
    <br /><br />
</div>

<div align="center">
    <h4>Simple Gantt</h4>
    <p align="center"> 
        <a href="https://frappe.github.io/gantt">
            <b>View the original demo (Frappe version) »</b>
        </a>
    </p>
    <a href="https://frappe.github.io/gantt">
        <img src="https://cloud.githubusercontent.com/assets/9355208/21537921/4a38b194-cdbd-11e6-8110-e0da19678a6d.png">
    </a>
     <br /><br /><br /><br />
</div>

### Install

```
npm install github.com/Kahuecosta/gantt
```

### Usage

Include it in your HTML:

```
<script src="simple-gantt.min.js"></script>
<link rel="stylesheet" href="simple-gantt.css">
```

You can also pass various options to the Gantt constructor:

| OPTION                               | DESCRIPTION                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| header_height                       | Header height                                                                                  |
| column_width                        | Default column width. Note: This value is overwritten internally                               |
| view_modes                          | Gantt view modes                                                                               |
| view_mode                           | Initial Gantt view mode                                                                        |
| bar_height                          | Height of the task bar                                                                         |
| bar_corner_radius                   | Corner radius of the task bar                                                                  |
| arrow_curve                         | Curve of the dependency arrow                                                                  |
| padding                             | Default padding for columns and rows                                                           |
| padding_start                       | Default padding at the start of the Gantt                                                      |
| padding_end                         | Default padding at the end of the Gantt                                                        |
| date_format                         | Default date format                                                                            |
| popup_trigger                       | Type of event that opens the popup                                                             |
| language                            | Gantt language. Mainly used for date translation                                               |
| margin_bottom                       | Bottom margin of the Gantt                                                                     |
| disallow_popup                      | Disable or enable the popup                                                                    |
| readonly                            | Disable or enable actions in the Gantt                                                         |
| draggable_bar                       | Disable or enable drag and drop for PERIOD in bars                                             |
| draggable_bar_handles               | Disable or enable drag and drop for PROGRESS in bars                                           |
| hasArrows                           | Disable or enable dependency lines                                                             |
| move_dependent                      | Move dependent tasks when moving a task                                                        |
| hide_labels                         | Hide task labels on the bar                                                                    |
| fixed_label_location                | Fix display of task labels next to the bar                                                     |
| horizontal_auto_scroll_labels       | Disable or enable task labels moving with horizontal scroll                                    |
| handle_bar_color                    | Default color for task resize handles                                                          |
| handle_progress_color               | Default color for task progress handle                                                         |
| resource_resize_enable              | Disable or enable resizing the resource tree                                                   |
| resource_fixed                      | Disable or enable fixed size for the resource tree                                             |
| resource_enable                     | Disable or enable the resource tree                                                            |
| resource_collapse_enable            | Disable or enable expand/collapse for groups in the resource tree                              |
| resource_title                      | Default title for the resource tree                                                            |
| resource_width                      | Default width for the resource tree                                                            |
| resource_min_width                  | Minimum width for the resource tree                                                            |
| responsables_enable                 | Disable or enable display of task assignee                                                     |
| responsables_sort_by                | Sort tasks in the tree by assignee                                                             |
| responsables_default_name           | Default assignee name when none is provided                                                    |
| responsables_default_photo          | Default assignee photo when none is provided                                                   |
| groups_enable                       | Disable or enable groups in the resource tree                                                  |
| groups_sort_by                      | Sort groups in the resource tree                                                               |
| workitems_sort_by                   | Sort tasks in the resource tree                                                                |
| workitems_custom_tooltip            | Enable tooltip customization                                                                   |
| workitems_click_tooltip_open_detail | Enable opening task details when clicking the tooltip                                          |
| new_workitem_enable                 | Enable direct task creation in the Gantt                                                       |
| new_workitem_text                   | Placeholder for the new task field                                                             |
| rows_alternate_background           | Disable or enable zebra-striped rows                                                           |
| grid_ticks                          | Disable or enable column markers                                                               |
| bar_color_default                   | Default bar color when none is provided in workitem                                            |
| link_detail_text                    | Text for the link inside the popup to open task details                                        |
| highlights_weekend                  | Highlight weekend columns with a different background                                          |
| highlights_past_days                | Highlight past day columns with a different background                                         |
| dir_assets                          | Relative path for component assets                                                             |
| zoom_max                            | Maximum zoom level                                                                             |

| EVENTS              | DESCRIPTION                                                  |
| ------------------- | ------------------------------------------------------------ |
| on_click            | Click on task bar                                            |
| on_dblclick         | Double click on task bar                                     |
| on_date_change      | Task period changed via drag and drop                        |
| on_progress_change  | Task progress changed via drag and drop                      |
| on_view_change      | Gantt view mode changed                                      |
| on_link_open_detail | Click on the link to open task details                       |

And start hacking:

```js
const responsables = [
    {
        id: 1,
        name: 'Kahuê Costa',
        photo: './images/responsable-1.jpg',
    },
    {
        id: 2,
        name: 'João Silva',
        photo: './images/responsable-default.png',
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

```js
const options = {
	on_click: function (workitem) {},
	on_dblclick: function (workitem) {},
	on_date_change: function (workitem, start, end) {},
	on_progress_change: function (workitem, progress) {},
	on_view_change: function (mode) {},
	on_link_open_detail: function (id) {},
	header_height: 50,
	view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
	view_mode: 'Day', // 'Quarter Day' - 'Half Day' - 'Day' - 'Week' - 'Month' - 'Year'
	bar_height: 20,
	bar_corner_radius: 3,
	arrow_curve: 5,
	padding: 18,
	padding_start: null, // view_mode: 'Day' => padding_start in days
	padding_end: null, // view_mode: 'Day' => padding_end in days
	date_format: 'YYYY-MM-DD',
	popup_trigger: 'click',
	custom_popup_html: null,
	language: 'en',
	margin_bottom: 100,
	disallow_popup: false,
	readonly: false,
	draggable_bar_handles: true,
	hasArrows: true,
	move_dependent: 'right', // 'left' - 'right' - 'both'
	fixed_label_location: false,
	hide_labels: false,
	horizontal_auto_scroll_labels: false,
	draggable_bar: true,
	handle_bar_color: '#752f00',
	handle_progress_color: '#752f00',
	resource_resize_enable: true,
	resource_fixed: true,
	resource_enable: true,
	resource_collapse_enable: true,
	resource_title: 'Tasks',
	resource_width: 250,
	resource_min_width: 300,
	responsables_enable: true,
	responsables_sort_by: 'default',
	responsables_default_name: 'Unassigned',
	responsables_default_photo: './images/responsable-default.png',
	groups_enable: false,
	groups_sort_by: 'name',
	workitems_sort_by: 'name',
	workitems_custom_tooltip: true,
	workitems_click_tooltip_open_detail: true,
	new_workitem_enable: false,
	new_workitem_text: 'Create task...',
	rows_alternate_background: false,
	grid_ticks: true,
	bar_color_default: '#f3f2f2',
	highlights_weekend: true,
	highlights_past_days: true,
	link_detail_text: 'View details',
	dir_assets: '../dist/assets',
	zoom_max: 5,
}

const gantt = new Gantt(
	'#gantt',
	workitems,
	workItemTypes,
	responsables,
	options
)
```

### Contributing

If you want to contribute enhancements or fixes:

1. Clone this repo.
2. `cd` into project directory
3. `yarn`
4. `yarn run dev`
5. Open `index.html` in your browser, make your code changes and test them.

### Publishing

If you have publishing rights, follow these steps to publish a new version.

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

Project maintained by [Kahuecosta](https://github.com/Kahuecosta)
