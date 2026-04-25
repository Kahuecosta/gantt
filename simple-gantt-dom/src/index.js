import date_utils from './utils/date.js';

export default class GanttDOM {
    constructor(wrapper, tasks, options = {}) {
        this.setup_wrapper(wrapper);
        this.setup_options(options);
        this.setup_tasks(tasks);

        this.render();
    }

    setup_wrapper(wrapper) {
        if (typeof wrapper === 'string') {
            this.$wrapper = document.querySelector(wrapper);
        } else {
            this.$wrapper = wrapper;
        }

        if (!this.$wrapper) {
            throw new Error('Wrapper element not found');
        }

        this.$container = document.createElement('div');
        this.$container.classList.add('gantt-dom-container');
        this.$wrapper.appendChild(this.$container);
    }

    setup_options(options) {
        const default_options = {
            column_width: 30,
            row_height: 40,
            bar_height: 24,
            padding: 10,
            view_mode: 'Day',
            language: 'en',
            highlight_critical_path: false,
        };
        this.options = Object.assign({}, default_options, options);
    }

    setup_tasks(tasks) {
        this.tasks = tasks.map((task) => {
            task._start = date_utils.parse(task.start);
            task._end = date_utils.parse(task.end);

            if (date_utils.diff(task._end, task._start, 'year') > 10) {
                 task._end = date_utils.add(task._start, 2, 'day');
            }

            task.invalid = task._end < task._start;
            task.duration = date_utils.diff(task._end, task._start, 'hour') / 24;
            task._id = task.id;

            if (!task.dependencies) {
                task.dependencies = [];
            } else if (typeof task.dependencies === 'string') {
                task.dependencies = task.dependencies.split(',').map(d => d.trim()).filter(d => d);
            }

            return task;
        });

        this.setup_gantt_dates();
    }

    setup_gantt_dates() {
        this.gantt_start = null;
        this.gantt_end = null;

        for (let task of this.tasks) {
            if (!this.gantt_start || task._start < this.gantt_start) {
                this.gantt_start = task._start;
            }
            if (!this.gantt_end || task._end > this.gantt_end) {
                this.gantt_end = task._end;
            }
        }

        this.gantt_start = date_utils.add(this.gantt_start, -3, 'day');
        this.gantt_end = date_utils.add(this.gantt_end, 3, 'day');

        this.setup_dates();
    }

    setup_dates() {
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

        this.render_header();
        this.render_body();
        this.render_bars();
        this.render_dependencies();
        this.bind_events();
    }

    bind_events() {
        this.tasks.forEach(task => {
            const bar = task.$bar;
            let is_dragging = false;
            let start_x = 0;
            let initial_left = 0;

            bar.addEventListener('mousedown', (e) => {
                is_dragging = true;
                start_x = e.clientX;
                initial_left = parseInt(bar.style.left);
                bar.style.zIndex = 1000;
            });

            window.addEventListener('mousemove', (e) => {
                if (!is_dragging) return;
                const dx = e.clientX - start_x;
                const new_left = initial_left + dx;

                // Snap to column
                const snapped_left = Math.round(new_left / this.options.column_width) * this.options.column_width;
                bar.style.left = `${new_left}px`;
            });

            window.addEventListener('mouseup', (e) => {
                if (!is_dragging) return;
                is_dragging = false;
                bar.style.zIndex = '';

                const final_left = parseInt(bar.style.left);
                const snapped_left = Math.round(final_left / this.options.column_width) * this.options.column_width;
                bar.style.left = `${snapped_left}px`;

                // Update task dates
                const day_diff = (snapped_left - initial_left) / this.options.column_width;
                if (day_diff !== 0) {
                    task._start = date_utils.add(task._start, day_diff, 'day');
                    task._end = date_utils.add(task._end, day_diff, 'day');
                    this.render();
                }
            });
        });
    }

    render_header() {
        const header = document.createElement('div');
        header.classList.add('gantt-header');
        header.style.width = `${this.dates.length * this.options.column_width}px`;

        for (let date of this.dates) {
            const cell = document.createElement('div');
            cell.classList.add('gantt-cell');
            cell.style.width = `${this.options.column_width}px`;
            cell.innerText = date_utils.format(date, 'D', this.options.language);
            header.appendChild(cell);
        }

        this.$container.appendChild(header);
    }

    render_body() {
        this.$body = document.createElement('div');
        this.$body.classList.add('gantt-body');
        this.$body.style.width = `${this.dates.length * this.options.column_width}px`;

        for (let i = 0; i < this.tasks.length; i++) {
            const row = document.createElement('div');
            row.classList.add('gantt-row');
            row.style.height = `${this.options.row_height}px`;

            for (let j = 0; j < this.dates.length; j++) {
                const cell = document.createElement('div');
                cell.classList.add('gantt-cell');
                cell.style.width = `${this.options.column_width}px`;
                row.appendChild(cell);
            }
            this.$body.appendChild(row);
        }

        this.$container.appendChild(this.$body);
    }

    render_bars() {
        this.$bars_container = document.createElement('div');
        this.$bars_container.classList.add('gantt-bars-container');
        this.$body.appendChild(this.$bars_container);

        this.tasks.forEach((task, i) => {
            const x = date_utils.diff(task._start, this.gantt_start, 'hour') / 24 * this.options.column_width;
            const y = i * this.options.row_height + (this.options.row_height - this.options.bar_height) / 2;
            const width = (date_utils.diff(task._end, task._start, 'hour') / 24) * this.options.column_width;

            let bar;
            if (task.duration === 0) {
                bar = document.createElement('div');
                bar.classList.add('gantt-milestone');
                bar.style.left = `${x - 8}px`;
                bar.style.top = `${i * this.options.row_height + (this.options.row_height - 16) / 2}px`;
            } else {
                bar = document.createElement('div');
                bar.classList.add('gantt-task-bar');
                bar.style.left = `${x}px`;
                bar.style.top = `${y}px`;
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
                const dep_task = this.get_task(dep_id);
                if (!dep_task) return;

                this.draw_dependency_line(dep_task, task);
            });
        });
    }

    draw_dependency_line(from_task, to_task) {
        const from_x = (date_utils.diff(from_task._end, this.gantt_start, 'hour') / 24) * this.options.column_width;
        const from_y = this.tasks.indexOf(from_task) * this.options.row_height + this.options.row_height / 2;

        const to_x = (date_utils.diff(to_task._start, this.gantt_start, 'hour') / 24) * this.options.column_width;
        const to_y = this.tasks.indexOf(to_task) * this.options.row_height + this.options.row_height / 2;

        const is_critical_link = this.options.highlight_critical_path && from_task.is_critical && to_task.is_critical && to_task.early_start === from_task.early_finish;

        const mid_x = from_x + (to_x - from_x) / 2;

        if (to_x > from_x) {
            // S-shaped curve or straight with mid-point
            this.create_line(from_x, from_y, mid_x, from_y, is_critical_link);
            this.create_line(mid_x, from_y, mid_x, to_y, is_critical_link);
            this.create_line(mid_x, to_y, to_x, to_y, is_critical_link);
        } else {
            // Backward link (overlap)
            const offset = 20;
            this.create_line(from_x, from_y, from_x + offset, from_y, is_critical_link);
            this.create_line(from_x + offset, from_y, from_x + offset, to_y, is_critical_link);
            this.create_line(from_x + offset, to_y, to_x, to_y, is_critical_link);
        }
    }

    create_line(x1, y1, x2, y2, is_critical) {
        const line = document.createElement('div');
        line.classList.add('dependency-line');
        if (is_critical) line.classList.add('critical');

        const width = Math.abs(x2 - x1) || 2;
        const height = Math.abs(y2 - y1) || 2;

        line.style.width = `${width}px`;
        line.style.height = `${height}px`;
        line.style.left = `${Math.min(x1, x2)}px`;
        line.style.top = `${Math.min(y1, y2)}px`;

        this.$bars_container.appendChild(line);
    }

    get_task(id) {
        return this.tasks.find(task => task.id == id);
    }

    compute_critical_path() {
        const tasks = this.tasks;
        tasks.forEach(t => {
            t.early_start = 0;
            t.early_finish = 0;
            t.late_start = 0;
            t.late_finish = 0;
            t.slack = 0;
            t.is_critical = false;
        });

        // Forward Pass
        const sorted = this.topological_sort();
        sorted.forEach(task => {
            let max_ef = 0;
            task.dependencies.forEach(dep_id => {
                const dep = this.get_task(dep_id);
                if (dep && dep.early_finish > max_ef) {
                    max_ef = dep.early_finish;
                }
            });
            task.early_start = max_ef;
            task.early_finish = task.early_start + task.duration;
        });

        // Backward Pass
        const max_duration = Math.max(...tasks.map(t => t.early_finish));
        sorted.reverse().forEach(task => {
            const successors = tasks.filter(t => t.dependencies.includes(task.id));
            if (successors.length === 0) {
                task.late_finish = max_duration;
            } else {
                task.late_finish = Math.min(...successors.map(s => s.late_start));
            }
            task.late_start = task.late_finish - task.duration;
            task.slack = task.late_start - task.early_start;
            if (task.slack <= 0) {
                task.is_critical = true;
            }
        });
    }

    topological_sort() {
        const nodes = this.tasks.map(t => t.id);
        const edges = [];
        this.tasks.forEach(t => {
            t.dependencies.forEach(dep => edges.push([dep, t.id]));
        });

        const sorted = [];
        const visited = new Set();
        const visiting = new Set();

        const visit = (id) => {
            if (visiting.has(id)) return; // Cycle
            if (!visited.has(id)) {
                visiting.add(id);
                const task = this.get_task(id);
                if (task) {
                    task.dependencies.forEach(dep => visit(dep));
                }
                visiting.delete(id);
                visited.add(id);
                sorted.push(id);
            }
        };

        nodes.forEach(id => visit(id));
        return sorted.map(id => this.get_task(id)).filter(t => t);
    }
}
