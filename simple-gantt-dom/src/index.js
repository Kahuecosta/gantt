import date_utils from './utils/date.js';

export default class GanttDOM {
    constructor(wrapper, tasks, types = [], responsables = [], groups = [], options = {}) {
        this.setup_wrapper(wrapper);
        this.setup_options(options);
        this.setup_tasks(tasks);
        this.types = types;
        this.responsables = responsables;
        this.groups = groups;

        this.render();
    }

    setup_wrapper(wrapper) {
        this.$wrapper = typeof wrapper === 'string' ? document.querySelector(wrapper) : wrapper;
        if (!this.$wrapper) throw new Error('Wrapper element not found');
        this.$wrapper.innerHTML = '';
        this.$container = document.createElement('div');
        this.$container.classList.add('gantt-dom-container');
        this.$wrapper.appendChild(this.$container);
    }

    setup_options(options) {
        this.options = Object.assign({
            column_width: 30,
            row_height: 40,
            bar_height: 24,
            view_mode: 'Day',
            language: 'en',
            highlight_critical_path: false,
            resource_enable: false,
            resource_width: 250,
            resource_title: 'Tasks',
            workitems_custom_tooltip: false
        }, options);
    }

    setup_tasks(tasks) {
        this.tasks = tasks.map((task) => {
            task._start = date_utils.parse(task.start);
            task._end = date_utils.parse(task.end);
            task.duration = Math.max(0, date_utils.diff(task._end, task._start, 'hour') / 24);
            task.dependencies = typeof task.dependencies === 'string' ? task.dependencies.split(',').map(d => d.trim()).filter(d => d) : (task.dependencies || []);
            return task;
        });
        this.setup_gantt_dates();
    }

    setup_gantt_dates() {
        const starts = this.tasks.map(t => t._start);
        const ends = this.tasks.map(t => t._end);
        this.gantt_start = starts.length ? new Date(Math.min(...starts)) : new Date();
        this.gantt_end = ends.length ? new Date(Math.max(...ends)) : new Date();

        this.gantt_start = date_utils.add(this.gantt_start, -3, 'day');
        this.gantt_end = date_utils.add(this.gantt_end, 3, 'day');

        this.dates = [];
        let cur = date_utils.clone(this.gantt_start);
        while (cur <= this.gantt_end) {
            this.dates.push(cur);
            cur = date_utils.add(cur, 1, 'day');
        }
    }

    render() {
        this.$container.innerHTML = '';
        this.compute_critical_path();

        const main_container = document.createElement('div');
        main_container.classList.add('gantt-main-container');
        this.$container.appendChild(main_container);

        if (this.options.resource_enable) {
            this.render_sidebar(main_container);
        }

        const timeline_container = document.createElement('div');
        timeline_container.style.overflowX = 'auto';
        timeline_container.style.flexGrow = '1';
        main_container.appendChild(timeline_container);

        this.render_header(timeline_container);
        this.render_body(timeline_container);
        this.render_bars();
        this.render_dependencies();
        this.bind_events();
        this.setup_tooltip();
    }

    render_sidebar(parent) {
        const sidebar = document.createElement('div');
        sidebar.classList.add('gantt-sidebar');
        sidebar.style.width = `${this.options.resource_width}px`;

        const header = document.createElement('div');
        header.classList.add('gantt-sidebar-header');
        header.innerText = this.options.resource_title;
        sidebar.appendChild(header);

        if (this.options.groups_enable && this.groups.length) {
            this.groups.forEach(group => {
                const group_row = document.createElement('div');
                group_row.classList.add('gantt-sidebar-row', 'group');
                group_row.innerText = group.name;
                sidebar.appendChild(group_row);

                const group_tasks = this.tasks.filter(t => t.group_id === group.id);
                group_tasks.forEach(task => {
                    const row = document.createElement('div');
                    row.classList.add('gantt-sidebar-row');
                    row.style.paddingLeft = '30px';
                    row.innerText = task.name;
                    sidebar.appendChild(row);
                });
            });
        } else {
            this.tasks.forEach(task => {
                const row = document.createElement('div');
                row.classList.add('gantt-sidebar-row');
                row.innerText = task.name;
                sidebar.appendChild(row);
            });
        }

        parent.appendChild(sidebar);
    }

    render_header(parent) {
        const header = document.createElement('div');
        header.classList.add('gantt-header');
        header.style.width = `${this.dates.length * this.options.column_width}px`;

        this.dates.forEach(date => {
            const cell = document.createElement('div');
            cell.classList.add('gantt-cell');
            cell.style.width = `${this.options.column_width}px`;
            cell.innerText = date_utils.format(date, 'D', this.options.language);
            header.appendChild(cell);
        });

        parent.appendChild(header);
    }

    render_body(parent) {
        this.$body = document.createElement('div');
        this.$body.classList.add('gantt-body');
        this.$body.style.width = `${this.dates.length * this.options.column_width}px`;

        let row_count = 0;
        if (this.options.groups_enable && this.groups.length) {
             this.groups.forEach(group => {
                 row_count++; // Group row
                 row_count += this.tasks.filter(t => t.group_id === group.id).length;
             });
        } else {
            row_count = this.tasks.length;
        }

        for(let i=0; i < row_count; i++) {
            const row = document.createElement('div');
            row.classList.add('gantt-row');
            row.style.height = `${this.options.row_height}px`;
            this.dates.forEach(() => {
                const cell = document.createElement('div');
                cell.classList.add('gantt-cell');
                cell.style.width = `${this.options.column_width}px`;
                row.appendChild(cell);
            });
            this.$body.appendChild(row);
        }

        parent.appendChild(this.$body);
    }

    get_task_row_index(task) {
        if (this.options.groups_enable && this.groups.length) {
            let index = 0;
            for (const group of this.groups) {
                index++; // Group row
                const group_tasks = this.tasks.filter(t => t.group_id === group.id);
                const task_in_group_index = group_tasks.indexOf(task);
                if (task_in_group_index !== -1) {
                    return index + task_in_group_index;
                }
                index += group_tasks.length;
            }
        }
        return this.tasks.indexOf(task);
    }

    render_bars() {
        this.$bars_container = document.createElement('div');
        this.$bars_container.classList.add('gantt-bars-container');
        this.$body.appendChild(this.$bars_container);

        this.tasks.forEach((task) => {
            const i = this.get_task_row_index(task);
            const x = (date_utils.diff(task._start, this.gantt_start, 'hour') / 24) * this.options.column_width;
            const width = task.duration * this.options.column_width;

            const bar = document.createElement('div');
            if (task.duration === 0) {
                bar.classList.add('gantt-milestone');
                bar.style.left = `${x - 8}px`;
                bar.style.top = `${i * this.options.row_height + (this.options.row_height - 16) / 2}px`;
            } else {
                bar.classList.add('gantt-task-bar');
                bar.style.left = `${x}px`;
                bar.style.top = `${i * this.options.row_height + (this.options.row_height - this.options.bar_height) / 2}px`;
                bar.style.width = `${width}px`;
                bar.innerText = task.name;
            }

            if (this.options.highlight_critical_path && task.is_critical) {
                bar.classList.add('critical');
            }

            bar.setAttribute('data-id', task.id);
            this.$bars_container.appendChild(bar);
            task.$bar = bar;
        });
    }

    render_dependencies() {
        this.tasks.forEach(task => {
            task.dependencies.forEach(dep_id => {
                const dep_task = this.tasks.find(t => t.id == dep_id);
                if (dep_task) this.draw_dependency_line(dep_task, task);
            });
        });
    }

    draw_dependency_line(from_task, to_task) {
        const from_x = (date_utils.diff(from_task._end, this.gantt_start, 'hour') / 24) * this.options.column_width;
        const from_y = this.get_task_row_index(from_task) * this.options.row_height + this.options.row_height / 2;
        const to_x = (date_utils.diff(to_task._start, this.gantt_start, 'hour') / 24) * this.options.column_width;
        const to_y = this.get_task_row_index(to_task) * this.options.row_height + this.options.row_height / 2;

        const is_critical = this.options.highlight_critical_path && from_task.is_critical && to_task.is_critical && to_task.early_start === from_task.early_finish;
        const mid_x = from_x + (to_x - from_x) / 2;

        if (to_x > from_x) {
            this.create_line(from_x, from_y, mid_x, from_y, is_critical);
            this.create_line(mid_x, from_y, mid_x, to_y, is_critical);
            this.create_line(mid_x, to_y, to_x, to_y, is_critical);
        } else {
            const offset = 20;
            this.create_line(from_x, from_y, from_x + offset, from_y, is_critical);
            this.create_line(from_x + offset, from_y, from_x + offset, to_y, is_critical);
            this.create_line(from_x + offset, to_y, to_x, to_y, is_critical);
        }
    }

    create_line(x1, y1, x2, y2, is_critical) {
        const line = document.createElement('div');
        line.classList.add('dependency-line');
        if (is_critical) line.classList.add('critical');
        line.style.width = `${Math.max(2, Math.abs(x2 - x1))}px`;
        line.style.height = `${Math.max(2, Math.abs(y2 - y1))}px`;
        line.style.left = `${Math.min(x1, x2)}px`;
        line.style.top = `${Math.min(y1, y2)}px`;
        this.$bars_container.appendChild(line);
    }

    bind_events() {
        this.tasks.forEach(task => {
            const bar = task.$bar;

            bar.onmousedown = (e) => {
                this.is_dragging = true;
                this.drag_task = task;
                this.drag_start_x = e.clientX;
                this.drag_initial_left = parseFloat(bar.style.left);
                bar.style.zIndex = 1000;
                this.hide_tooltip();
            };
        });

        if (!this.events_bound) {
            window.addEventListener('mousemove', (e) => {
                if (!this.is_dragging || !this.drag_task) return;
                const dx = e.clientX - this.drag_start_x;
                this.drag_task.$bar.style.left = `${this.drag_initial_left + dx}px`;
            });

            window.addEventListener('mouseup', () => {
                if (!this.is_dragging || !this.drag_task) return;
                const task = this.drag_task;
                const bar = task.$bar;

                this.is_dragging = false;
                this.drag_task = null;
                bar.style.zIndex = '';

                const final_left = parseFloat(bar.style.left);
                const day_diff = Math.round((final_left - (date_utils.diff(task._start, this.gantt_start, 'hour') / 24 * this.options.column_width)) / this.options.column_width);

                if (day_diff !== 0) {
                    task._start = date_utils.add(task._start, day_diff, 'day');
                    task._end = date_utils.add(task._end, day_diff, 'day');
                    this.render();
                } else {
                    this.render(); // Snap back
                }
            });
            this.events_bound = true;
        }
    }

    setup_tooltip() {
        this.$tooltip = document.createElement('div');
        this.$tooltip.classList.add('gantt-tooltip');
        this.$container.appendChild(this.$tooltip);

        this.tasks.forEach(task => {
            task.$bar.onmouseenter = (e) => {
                this.show_tooltip(task, e);
            };
            task.$bar.onmouseleave = () => {
                this.hide_tooltip();
            };
        });
    }

    show_tooltip(task, e) {
        if (this.options.workitems_custom_tooltip) {
            const custom = document.querySelector(`[data-gantt-tooltip-id="${task.id}"]`);
            if (custom) {
                this.$tooltip.innerHTML = custom.innerHTML;
            } else {
                this.$tooltip.innerHTML = `<strong>${task.name}</strong>`;
            }
        } else {
            this.$tooltip.innerHTML = `
                <div style="font-weight: bold">${task.name}</div>
                <div>Start: ${date_utils.format(task._start, 'YYYY-MM-DD')}</div>
                <div>End: ${date_utils.format(task._end, 'YYYY-MM-DD')}</div>
            `;
        }
        this.$tooltip.style.display = 'block';
        this.$tooltip.style.left = `${e.clientX - this.$container.getBoundingClientRect().left + 10}px`;
        this.$tooltip.style.top = `${e.clientY - this.$container.getBoundingClientRect().top + 10}px`;
    }

    hide_tooltip() {
        this.$tooltip.style.display = 'none';
    }

    compute_critical_path() {
        this.tasks.forEach(t => { t.early_start = 0; t.early_finish = 0; t.late_start = 0; t.late_finish = 0; t.slack = 0; t.is_critical = false; });
        const sorted = this.topological_sort();
        sorted.forEach(task => {
            let max_ef = 0;
            task.dependencies.forEach(dep_id => {
                const dep = this.tasks.find(t => t.id == dep_id);
                if (dep && dep.early_finish > max_ef) max_ef = dep.early_finish;
            });
            task.early_start = max_ef;
            task.early_finish = task.early_start + task.duration;
        });
        const max_duration = Math.max(...this.tasks.map(t => t.early_finish), 0);
        sorted.reverse().forEach(task => {
            const successors = this.tasks.filter(t => t.dependencies.includes(task.id));
            task.late_finish = successors.length === 0 ? max_duration : Math.min(...successors.map(s => s.late_start));
            task.late_start = task.late_finish - task.duration;
            task.slack = task.late_start - task.early_start;
            if (task.slack <= 0) task.is_critical = true;
        });
    }

    topological_sort() {
        const sorted = [], visited = new Set(), visiting = new Set();
        const visit = (task) => {
            if (visiting.has(task.id)) return;
            if (!visited.has(task.id)) {
                visiting.add(task.id);
                task.dependencies.forEach(dep_id => {
                    const dep = this.tasks.find(t => t.id == dep_id);
                    if (dep) visit(dep);
                });
                visiting.delete(task.id);
                visited.add(task.id);
                sorted.push(task);
            }
        };
        this.tasks.forEach(t => visit(t));
        return sorted;
    }

    change_view_mode(mode) {
        this.options.view_mode = mode;
        // In a real impl, we would change column_width etc.
        this.render();
    }
}
