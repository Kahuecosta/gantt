var Gantt = (function () {
	'use strict';

	const YEAR = 'year';
	const MONTH = 'month';
	const DAY = 'day';
	const HOUR = 'hour';
	const MINUTE = 'minute';
	const SECOND = 'second';
	const MILLISECOND = 'millisecond';

	const DATA_OPEN = {
		OPEN: 'open',
		CLOSE: 'close',
	};

	const DATA_TYPE = {
		GROUP: 'group',
		SUB_GROUP: 'sub-group',
		WORKITEM: 'workitem',
		RESPONSABLE: 'responsable',
		NEW_WORKITEM: 'new-workitem',
	};

	const DATA_ATTR = {
		ID: 'data-id',
		OPEN: 'data-open',
		TYPE: 'data-type',
		TOGGLE: 'data-toggle',
		GROUP_ID: 'data-group-id',
		TYPE_PARENT: 'data-type-parent',
		SUB_GROUP_ID: 'data-sub-group-id',
		OPACITY: 'opacity',
	};

	const RESPONSABLE_DEFAULT_ID = 0;

	const VIEW_MODE = {
		HOUR: 'Hour',
		QUARTER_DAY: 'Quarter Day',
		HALF_DAY: 'Half Day',
		DAY: 'Day',
		WEEK: 'Week',
		MONTH: 'Month',
		YEAR: 'Year',
	};

	const utils = {
		parse(date, date_separator = '-', time_separator = /[.:]/) {
			if (date instanceof Date) {
				return date
			}

			if (typeof date === 'string') {
				let date_parts, time_parts;
				const parts = date.split(' ');

				date_parts = parts[0].split(date_separator).map(val => parseInt(val, 10));
				time_parts = parts[1] && parts[1].split(time_separator);

				// month is 0 indexed
				date_parts[1] = date_parts[1] - 1;

				let vals = date_parts;

				if (time_parts && time_parts.length) {
					if (time_parts.length == 4) {
						time_parts[3] = '0.' + time_parts[3];
						time_parts[3] = parseFloat(time_parts[3]) * 1000;
					}

					vals = vals.concat(time_parts);
				}

				return new Date(...vals)
			}
		},

		to_string(date, with_time = false) {
			if (!(date instanceof Date)) {
				throw new TypeError('Invalid argument type')
			}

			const vals = this.get_date_values(date).map((val, i) => {
				if (i === 1) {
					// add 1 for month
					val = val + 1;
				}

				if (i === 6) {
					return utils.padStart(val + '', 3, '0')
				}

				return utils.padStart(val + '', 2, '0')
			});

			const date_string = `${vals[0]}-${vals[1]}-${vals[2]}`;
			const time_string = `${vals[3]}:${vals[4]}:${vals[5]}.${vals[6]}`;

			return date_string + (with_time ? ' ' + time_string : '')
		},

		date_format(date, lang, options) {
			const dateTimeFormat = new Intl.DateTimeFormat(lang, options);

			const format = dateTimeFormat.format(date);

			return format
		},

		format(date, format_string = 'YYYY-MM-DD HH:mm:ss.SSS', lang = 'en') {
			const month_name = this.date_format(date, lang, { month: 'long' });

			const wday_name = this.date_format(date, lang, { weekday: 'short' });

			const month_name_capitalized =
				month_name.charAt(0).toUpperCase() + month_name.slice(1);

			const values = this.get_date_values(date).map(d => utils.padStart(d, 2, 0));

			const format_map = {
				YYYY: values[0],
				MM: utils.padStart(+values[1] + 1, 2, 0),
				DD: values[2],
				HH: values[3],
				mm: values[4],
				ss: values[5],
				SSS: values[6],
				D: values[2],
				MMMM: month_name_capitalized,
				MMM: month_name_capitalized,
				ddd: wday_name.replace('.', ''),
			};

			let str = format_string;

			const formatted_values = [];

			Object.keys(format_map)
				.sort((a, b) => b.length - a.length) // big string first
				.forEach(key => {
					if (str.includes(key)) {
						str = str.replace(key, `$${formatted_values.length}`);
						formatted_values.push(format_map[key]);
					}
				});

			formatted_values.forEach((value, i) => {
				str = str.replace(`$${i}`, value);
			});

			return str
		},

		diff(date_a, date_b, scale = DAY) {
			let milliseconds, seconds, hours, minutes, days, months, years;

			milliseconds = date_a - date_b;
			seconds = milliseconds / 1000;
			minutes = seconds / 60;
			hours = minutes / 60;
			days = hours / 24;
			months = days / 30;
			years = months / 12;

			if (!scale.endsWith('s')) {
				scale += 's';
			}

			return Math.floor(
				{
					milliseconds,
					seconds,
					minutes,
					hours,
					days,
					months,
					years,
				}[scale]
			)
		},

		today() {
			const vals = this.get_date_values(new Date()).slice(0, 3);

			return new Date(...vals)
		},

		now() {
			return new Date()
		},

		add(date, qty, scale) {
			qty = parseInt(qty, 10);

			const vals = [
				date.getFullYear() + (scale === YEAR ? qty : 0),
				date.getMonth() + (scale === MONTH ? qty : 0),
				date.getDate() + (scale === DAY ? qty : 0),
				date.getHours() + (scale === HOUR ? qty : 0),
				date.getMinutes() + (scale === MINUTE ? qty : 0),
				date.getSeconds() + (scale === SECOND ? qty : 0),
				date.getMilliseconds() + (scale === MILLISECOND ? qty : 0),
			];

			return new Date(...vals)
		},

		start_of(date, scale) {
			const scores = {
				[YEAR]: 6,
				[MONTH]: 5,
				[DAY]: 4,
				[HOUR]: 3,
				[MINUTE]: 2,
				[SECOND]: 1,
				[MILLISECOND]: 0,
			};

			function should_reset(_scale) {
				const max_score = scores[scale];
				return scores[_scale] <= max_score
			}

			const vals = [
				date.getFullYear(),
				should_reset(YEAR) ? 0 : date.getMonth(),
				should_reset(MONTH) ? 1 : date.getDate(),
				should_reset(DAY) ? 0 : date.getHours(),
				should_reset(HOUR) ? 0 : date.getMinutes(),
				should_reset(MINUTE) ? 0 : date.getSeconds(),
				should_reset(SECOND) ? 0 : date.getMilliseconds(),
			];

			return new Date(...vals)
		},

		clone(date) {
			return new Date(...this.get_date_values(date))
		},

		get_date_values(date) {
			return [
				date.getFullYear(),
				date.getMonth(),
				date.getDate(),
				date.getHours(),
				date.getMinutes(),
				date.getSeconds(),
				date.getMilliseconds(),
			]
		},

		get_days_in_month(date) {
			const no_of_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

			const month = date.getMonth();

			if (month !== 1) {
				return no_of_days[month]
			}

			// Feb
			const year = date.getFullYear();

			if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
				return 29
			}

			return 28
		},

		padStart(str, targetLength, padString) {
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart

			str = str + '';
			targetLength = targetLength >> 0;
			padString = String(typeof padString !== 'undefined' ? padString : ' ');

			if (str.length > targetLength) {
				return String(str)
			} else {
				targetLength = targetLength - str.length;

				if (targetLength > padString.length) {
					padString += padString.repeat(targetLength / padString.length);
				}

				return padString.slice(0, targetLength) + String(str)
			}
		},
	};

	function $(expr, con) {
		return typeof expr === 'string'
			? (con || document).querySelector(expr)
			: expr || null
	}

	function createSVG(tag, attrs) {
		const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);

		for (let attr in attrs) {
			if (attr === 'append_to') {
				const parent = attrs.append_to;
				parent.appendChild(elem);
			} else if (attr === 'innerHTML') {
				elem.innerHTML = attrs.innerHTML;
			} else if (attr === 'clipPath') {
				elem.setAttribute('clip-path', 'url(#' + attrs[attr] + ')');
			} else {
				elem.setAttribute(attr, attrs[attr]);
			}

			if (attr === 'y') {
				elem.setAttribute('data-original-y', attrs[attr]);
			} else if (attr === 'x') {
				elem.setAttribute('data-original-x', attrs[attr]);
			} else if (attr === 'height') {
				elem.setAttribute('data-original-height', attrs[attr]);
			}
		}

		return elem
	}

	$.on = (element, event, selector, callback) => {
		if (!callback) {
			callback = selector;

			$.bind(element, event, callback);
		} else {
			$.delegate(element, event, selector, callback);
		}
	};

	$.off = (element, event, handler) => {
		element.removeEventListener(event, handler);
	};

	$.bind = (element, event, callback) => {
		event.split(/\s+/).forEach(function (event) {
			element.addEventListener(event, callback);
		});
	};

	$.delegate = (element, event, selector, callback) => {
		element.addEventListener(event, function (e) {
			const delegatedTarget = e.target.closest(selector);

			if (delegatedTarget) {
				e.delegatedTarget = delegatedTarget;
				callback.call(this, e, delegatedTarget);
			}
		});
	};

	$.closest = (selector, element) => {
		if (!element) return null

		if (element.matches(selector)) {
			return element
		}

		return $.closest(selector, element.parentNode)
	};

	$.attr = (element, attr, value) => {
		if (!value && typeof attr === 'string') {
			return element.getAttribute(attr)
		}

		if (typeof attr === 'object') {
			for (let key in attr) {
				$.attr(element, key, attr[key]);
			}

			return
		}

		element.setAttribute(attr, value);
	};

	class Bar {
		constructor(gantt, task, resource_width) {
			this.set_defaults(gantt, task, resource_width);
			this.prepare();
			this.draw();
			this.bind();
		}

		set_defaults(gantt, task, resource_width) {
			this.action_completed = false;
			this.gantt = gantt;
			this.task = task;
			this.resource_width = resource_width;
		}

		prepare() {
			this.prepare_values();
			this.prepare_helpers();
		}

		prepare_values() {
			this.invalid = this.task.invalid;
			this.height = this.gantt.options.bar_height;
			this.image_size = this.gantt.options.bar_height - 5;
			this.x = this.compute_x();
			this.y = this.compute_y();
			this.corner_radius = this.gantt.options.bar_corner_radius;
			this.duration =
				utils.diff(this.task._end, this.task._start, 'hour') /
				this.gantt.step;
			this.width = this.gantt.column_width * this.duration;
			this.progress_width =
				this.gantt.column_width * this.duration * (this.task.progress / 100) || 0;
			this.group = createSVG('g', {
				class:
					'bar-wrapper ' +
					(this.task._type ? `${this.task._type.bar_class} ` : ''),
				'data-id': this.task.id,
				'data-type-id': this.task.type_id,
			});
			this.bar_group = createSVG('g', {
				class: 'bar-group',
				append_to: this.group,
			});
			this.handle_group = createSVG('g', {
				class: 'handle-group',
				append_to: this.group,
			});
		}

		prepare_helpers() {
			SVGElement.prototype.getX = function () {
				return +this.getAttribute('x')
			};
			SVGElement.prototype.getY = function () {
				return +this.getAttribute('y')
			};
			SVGElement.prototype.getWidth = function () {
				return +this.getAttribute('width')
			};
			SVGElement.prototype.getHeight = function () {
				return +this.getAttribute('height')
			};
			SVGElement.prototype.getEndX = function () {
				return this.getX() + this.getWidth()
			};
		}

		draw() {
			this.draw_bar();
			this.draw_progress_bar();
			this.draw_label();
			this.draw_thumbnail();
			this.draw_resize_handles();
		}

		draw_bar() {
			this.$bar = createSVG('rect', {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				rx: this.corner_radius,
				ry: this.corner_radius,
				class: 'bar',
				fill: `${this.task.bar_color || this.gantt.options.bar_color_default}`,
				append_to: this.bar_group,
			});

			if (this.invalid) {
				this.$bar.classList.add('bar-invalid');
			}
		}

		draw_progress_bar() {
			if (this.invalid) return

			this.$bar_progress = createSVG('rect', {
				x: this.x,
				y: this.y,
				width: this.progress_width,
				height: this.height,
				rx: this.corner_radius,
				ry: this.corner_radius,
				class: 'bar-progress',
				append_to: this.bar_group,
			});
		}

		draw_label() {
			let x_coord;
			let padding = 5;

			if (this.task.img) {
				x_coord = this.x + this.image_size + padding;
			} else {
				x_coord = this.x + 5;
			}

			createSVG('text', {
				x: x_coord,
				y: this.y + this.height / 2,
				innerHTML: this.task.name,
				class: `bar-label ${this.gantt.options.hide_labels ? 'hide' : ''}`,
				append_to: this.bar_group,
			});

			// labels get BBox in the next tick
			// eslint-disable-next-line no-undef
			requestAnimationFrame(() => this.update_label_position());
		}

		draw_thumbnail() {
			if (!this.task.thumbnail) return

			let x_offset = 10;
			let y_offset = 2;
			let defs, clipPath;

			defs = createSVG('defs', {
				append_to: this.bar_group,
			});

			createSVG('rect', {
				id: 'rect_' + this.task.id,
				x: this.x + x_offset,
				y: this.y + y_offset,
				width: this.image_size,
				height: this.image_size,
				rx: '15',
				class: 'img_mask',
				append_to: defs,
			});

			clipPath = createSVG('clipPath', {
				id: 'clip_' + this.task.id,
				append_to: defs,
			});

			createSVG('use', {
				href: '#rect_' + this.task.id,
				append_to: clipPath,
			});

			createSVG('image', {
				x: this.x + x_offset,
				y: this.y + y_offset,
				width: this.image_size,
				height: this.image_size,
				class: 'bar-img',
				href: this.task.thumbnail,
				clipPath: 'clip_' + this.task.id,
				append_to: this.bar_group,
			});
		}

		draw_resize_handles() {
			if (this.gantt.options.readonly) return

			if (!this.gantt.options.draggable_bar_handles) return

			if (this.invalid) return

			const bar = this.$bar;
			const handle_width = 8;

			createSVG('rect', {
				x: bar.getX() + bar.getWidth() - 9,
				y: bar.getY() + 1,
				width: handle_width,
				height: this.height - 2,
				rx: this.corner_radius,
				ry: this.corner_radius,
				class: 'handle right',
				fill: this.gantt.options.handle_bar_color,
				append_to: this.handle_group,
			});

			createSVG('rect', {
				x: bar.getX() + 1,
				y: bar.getY() + 1,
				width: handle_width,
				height: this.height - 2,
				rx: this.corner_radius,
				ry: this.corner_radius,
				class: 'handle left',
				fill: this.gantt.options.handle_bar_color,
				append_to: this.handle_group,
			});

			if (this.task.progress && this.task.progress < 100) {
				this.$handle_progress = createSVG('polygon', {
					points: this.get_progress_polygon_points().join(','),
					class: 'handle progress',
					fill: this.gantt.options.handle_progress_color,
					append_to: this.handle_group,
				});
			}
		}

		get_progress_polygon_points() {
			const bar_progress = this.$bar_progress;

			if (!bar_progress) {
				return []
			}

			return [
				bar_progress.getEndX() - 5,
				bar_progress.getY() + bar_progress.getHeight(),
				bar_progress.getEndX() + 5,
				bar_progress.getY() + bar_progress.getHeight(),
				bar_progress.getEndX(),
				bar_progress.getY() + bar_progress.getHeight() - 12.66,
			]
		}

		bind() {
			if (this.invalid) return

			this.setup_click_event();
		}

		setup_click_event() {
			$.on(this.group, 'focus ' + this.gantt.options.popup_trigger, () => {
				if (this.action_completed) {
					// just finished a move action, wait for a few seconds
					return
				}

				if (!this.gantt.options.disallow_popup) {
					this.show_popup();
					this.gantt.unselect_all();
					this.group.classList.add('active');
				}
			});

			$.on(this.group, 'dblclick', () => {
				if (this.action_completed) {
					// just finished a move action, wait for a few seconds
					return
				}

				this.gantt.trigger_event('dblclick', [this.task]);
			});

			$.on(this.group, 'click', () => {
				if (this.action_completed) {
					// just finished a move action, wait for a few seconds
					return
				}

				this.gantt.trigger_event('click', [this.task]);
			});
		}

		show_popup() {
			if (this.gantt.bar_being_dragged) return

			const start_date = utils.format(
				this.task._start,
				'MMM D',
				this.gantt.options.language
			);
			const end_date = utils.format(
				utils.add(this.task._end, -1, 'second'),
				'MMM D YY',
				this.gantt.options.language
			);

			if (this.gantt.options.workitems_custom_tooltip) {
				this.gantt.show_custom_popup({
					target_element: this.$bar,
					task: this.task,
				});
			} else {
				this.gantt.show_popup({
					target_element: this.$bar,
					title: `<b>${this.task.name}</b>`,
					subtitle: '',
					period: `${start_date} - ${end_date}`,
					task: this.task,
					link_detail_text: this.gantt.options.link_detail_text,
				});
			}
		}

		update_bar_position({ x = null, width = null, update_original_x = true }) {
			const bar = this.$bar;

			if (x && x >= this.resource_width) {
				// get all x values of parent task
				const xs = this.task.dependencies.map(dep =>
					this.gantt.get_bar(dep).$bar.getX()
				);

				// child task must not go before parent
				const valid_x = xs.reduce((prev, curr) => x >= curr, x);

				if (!valid_x) {
					width = null;
					return
				}

				this.update_attr(bar, 'x', x);

				update_original_x && this.update_attr(bar, 'data-original-x', x);
			}

			if (width && width >= this.gantt.column_width) {
				this.update_attr(bar, 'width', width);
			}

			this.update_label_position(update_original_x);
			this.update_handle_position(update_original_x);
			this.update_progressbar_position(update_original_x);

			this.update_arrow_position();
		}

		update_label_position_on_horizontal_scroll({ x, sx }) {
			const container = document.querySelector('.gantt-container');
			const label = this.group.querySelector('.bar-label');
			const img = this.group.querySelector('.bar-img') || '';
			const img_mask = this.bar_group.querySelector('.img_mask') || '';
			const barX = this.$bar.getX();

			let barWidthLimit = barX + this.$bar.getWidth();
			let newLabelX = label.getX() + x;
			let newImgX = (img && img.getX() + x) || 0;
			let imgWidth = (img && img.getBBox().width + 7) || 7;
			let labelEndX = newLabelX + label.getBBox().width + 7;
			let viewportCentral = sx + container.clientWidth / 2;

			if (label.classList.contains('big')) return

			if (labelEndX < barWidthLimit && x > 0 && labelEndX < viewportCentral) {
				this.update_attr(label, 'x', newLabelX);

				if (img) {
					this.update_attr(img, 'x', newImgX);
					this.update_attr(img_mask, 'x', newImgX);
				}
			} else if (
				newLabelX - imgWidth > barX &&
				x < 0 &&
				labelEndX > viewportCentral
			) {
				this.update_attr(label, 'x', newLabelX);

				if (img) {
					this.update_attr(img, 'x', newImgX);
					this.update_attr(img_mask, 'x', newImgX);
				}
			}
		}

		date_changed() {
			let changed = false;

			const { new_start_date, new_end_date } = this.compute_start_end_date();

			if (Number(this.task._start) !== Number(new_start_date)) {
				changed = true;

				this.task._start = new_start_date;
			}

			if (Number(this.task._end) !== Number(new_end_date)) {
				changed = true;

				this.task._end = new_end_date;
			}

			if (!changed) return

			this.gantt.trigger_event('date_change', [
				this.task,
				new_start_date,
				utils.add(new_end_date, -1, 'second'),
			]);
		}

		progress_changed() {
			const new_progress = this.compute_progress();

			this.task.progress = new_progress;
			this.gantt.trigger_event('progress_change', [this.task, new_progress]);
		}

		set_action_completed() {
			this.action_completed = true;

			setTimeout(() => (this.action_completed = false), 1000);
		}

		compute_start_end_date() {
			const resource_line = $('.resource-line');

			const resource_width = resource_line ? resource_line.getX() : 0;

			const bar = this.$bar;

			const x_in_units = (bar.getX() - resource_width) / this.gantt.column_width;

			const new_start_date = utils.add(
				this.gantt.gantt_start,
				x_in_units * this.gantt.step,
				'hour'
			);

			const width_in_units = bar.getWidth() / this.gantt.column_width;

			const new_end_date = utils.add(
				new_start_date,
				width_in_units * this.gantt.step,
				'hour'
			);

			return { new_start_date, new_end_date }
		}

		compute_progress() {
			const progress =
				(this.$bar_progress.getWidth() / this.$bar.getWidth()) * 100;

			return parseInt(progress, 10)
		}

		compute_x() {
			const task_start = this.task._start;
			const gantt_start = this.gantt.gantt_start;
			const diff = utils.diff(task_start, gantt_start, 'hour');

			let x = (diff / this.gantt.step) * this.gantt.column_width;

			if (this.gantt.view_is('Month')) {
				const diff = utils.diff(task_start, gantt_start, 'day');

				x = (diff * this.gantt.column_width) / 30;
			}

			return this.resource_width + x
		}

		compute_y() {
			return (
				this.gantt.options.header_height +
				this.gantt.options.padding +
				this.task._index * (this.height + this.gantt.options.padding)
			)
		}

		get_snap_position(dx) {
			let odx = dx,
				rem,
				position;

			if (this.gantt.view_is('Week')) {
				rem = dx % (this.gantt.column_width / 7);
				position =
					odx -
					rem +
					(rem < this.gantt.column_width / 14 ? 0 : this.gantt.column_width / 7);
			} else if (this.gantt.view_is('Month')) {
				rem = dx % (this.gantt.column_width / 30);
				position =
					odx -
					rem +
					(rem < this.gantt.column_width / 60 ? 0 : this.gantt.column_width / 30);
			} else {
				rem = dx % this.gantt.column_width;
				position =
					odx -
					rem +
					(rem < this.gantt.column_width / 2 ? 0 : this.gantt.column_width);
			}

			return position
		}

		update_attr(element, attr, value) {
			value = +value;

			if (!isNaN(value)) {
				element.setAttribute(attr, value);
			}

			return element
		}

		update_progressbar_position(update_original_x) {
			const w = this.$bar.getWidth() * (this.task.progress / 100);
			const x = this.$bar.getX();

			this.update_attr(this.$bar_progress, 'x', x);
			this.update_attr(this.$bar_progress, 'width', w);

			if (update_original_x) {
				this.update_attr(this.$bar_progress, 'data-original-x', x);
			}
		}

		update_label_position(update_original_x) {
			const bar = this.$bar;
			const img_mask = this.bar_group.querySelector('.img_mask') || '';
			const label = this.group.querySelector('.bar-label');
			const img = this.group.querySelector('.bar-img');
			const barX = bar.getX();
			const barW = bar.getWidth();
			const labelW = label.getBBox().width;
			const padding = 5;
			const x_offset_label_img = this.image_size + 10;

			let xp;
			let xo;

			if (this.gantt.options.fixed_label_location || labelW > barW) {
				label.classList.add('big');

				const x = barX + barW;

				xp = x + padding;
				xo = x + x_offset_label_img;
			} else {
				label.classList.remove('big');

				xp = barX + padding;
				xo = barX + x_offset_label_img;
			}

			if (img) {
				this.update_attr(img, 'x', xp);
				this.update_attr(img_mask, 'x', xp);
				this.update_attr(label, 'x', xo);

				update_original_x && this.update_attr(img, 'data-original-x', xp);
				update_original_x && this.update_attr(img_mask, 'data-original-x', xp);
				update_original_x && this.update_attr(label, 'data-original-x', xo);
			} else {
				this.update_attr(label, 'x', xp);

				update_original_x && this.update_attr(label, 'data-original-x', xp);
			}
		}

		update_handle_position(update_original_x) {
			const bar = this.$bar;
			const barX = bar.getX() + 1;
			const barEX = bar.getEndX() - 9;

			const hl = this.handle_group.querySelector('.handle.left');
			const hr = this.handle_group.querySelector('.handle.right');

			this.update_attr(hl, 'x', barX);
			this.update_attr(hr, 'x', barEX);

			update_original_x && this.update_attr(hl, 'data-original-x', barX);
			update_original_x && this.update_attr(hr, 'data-original-x', barEX);

			const handle = this.group.querySelector('.handle.progress');

			if (handle) {
				this.update_attr(handle, 'points', this.get_progress_polygon_points());
			}
		}

		update_arrow_position() {
			this.arrows = this.arrows || [];

			for (let arrow of this.arrows) {
				arrow.update();
			}
		}
	}

	class Arrow {
		constructor(gantt, from_task, to_task) {
			this.gantt = gantt;
			this.from_task = from_task;
			this.to_task = to_task;

			this.calculate_path();
			this.draw();
		}

		calculate_path() {
			const { padding, bar_height, header_height } = this.gantt.options;

			let start_x =
				this.from_task.$bar.getX() + this.from_task.$bar.getWidth() / 2;

			const condition = () =>
				this.to_task.$bar.getX() < start_x + padding &&
				start_x > this.from_task.$bar.getX() + padding;

			while (condition()) {
				start_x -= 10;
			}

			const start_y =
				header_height +
				bar_height +
				(padding + bar_height) * this.from_task.task._index +
				padding;
			const end_x = this.to_task.$bar.getX() - padding / 2;
			const end_y =
				header_height +
				bar_height / 2 +
				(padding + bar_height) * this.to_task.task._index +
				padding;
			const from_is_below_to =
				this.from_task.task._index > this.to_task.task._index;
			const curve = this.gantt.options.arrow_curve;
			const clockwise = from_is_below_to ? 1 : 0;
			const curve_y = from_is_below_to ? -curve : curve;
			const offset = from_is_below_to
				? end_y + this.gantt.options.arrow_curve
				: end_y - this.gantt.options.arrow_curve;

			const M = `M ${start_x} ${start_y}`;
			const V = `V ${offset}`;
			const a = `a ${curve} ${curve} 0 0 ${clockwise} ${curve} ${curve_y}`;
			const L = `L ${end_x} ${end_y}`;
			const m = `m -5 -5`;
			const l1 = `l 5 5`;
			const l2 = `l -5 5`;

			this.path = `${M}  ${V}  ${a}  ${L}  ${m} ${l1} ${l2}`;

			if (this.to_task.$bar.getX() < this.from_task.$bar.getX() + padding) {
				const down_1 = padding / 2 - curve;
				const down_2 =
					this.to_task.$bar.getY() + this.to_task.$bar.getHeight() / 2 - curve_y;
				const left = this.to_task.$bar.getX() - padding;

				const M = `M ${start_x} ${start_y}`;
				const Mv = `v ${down_1}`;
				const Ma = `a ${curve} ${curve} 0 0 1 -${curve} ${curve}`;
				const H = `H ${left}`;
				const Ha = `a ${curve} ${curve} 0 0 ${clockwise} -${curve} ${curve_y}`;
				const V = `V ${down_2}`;
				const Va = `a ${curve} ${curve} 0 0 ${clockwise} ${curve} ${curve_y}`;
				const L = `L ${end_x} ${end_y}`;
				const Lm = `m -5 -5`;
				const Ll = `l 5 5`;
				const Lll = `l -5 5`;

				this.path = `${M} ${Mv} ${Ma} ${H} ${Ha}  ${V}  ${Va}  ${L}  ${Lm} ${Ll} ${Lll}`;
			}
		}

		draw() {
			this.element = createSVG('path', {
				d: this.path,
				'data-from': this.from_task.task.id,
				'data-to': this.to_task.task.id,
			});
		}

		update() {
			this.calculate_path();
			this.element.setAttribute('d', this.path);
		}
	}

	class Popup {
		constructor(gantt, parent, custom_html, container) {
			this.gantt = gantt;
			this.parent = parent;
			this.custom_html = custom_html;
			this.container = container;

			this.make();
		}

		make() {
			this.parent.innerHTML = `
            <div class="title"></div>
            <div class="tooltip-line responsable"></div>
						<div class="tooltip-line type"></div>
            <div class="tooltip-line period"></div>
						<div class="tooltip-line details"></div>
            <div class="popup-pointer"></div>
        `;

			this.hide();

			this.title = this.parent.querySelector('.title');
			this.responsable = this.parent.querySelector('.responsable');
			this.type = this.parent.querySelector('.type');
			this.period = this.parent.querySelector('.period');
			this.details = this.parent.querySelector('.details');
			this.pointer = this.parent.querySelector('.popup-pointer');

			this.bind_events();
		}

		bind_events() {
			$.on(this.details, 'click', e => {
				if (e.target.className === 'link-detail') {
					const id = e.target.getAttribute('data-task-id');

					this.gantt.trigger_event('link_open_detail', [id]);
				}
			});
		}

		show(options) {
			if (!options.target_element) {
				throw new Error('target_element is required to show popup')
			}

			if (!options.position) {
				options.position = 'left';
			}

			const target_element = options.target_element;

			if (this.custom_html) {
				let html = this.custom_html(options.task);
				html += '<div class="popup-pointer"></div>';
				this.parent.innerHTML = html;
				this.pointer = this.parent.querySelector('.popup-pointer');
			} else {
				// set data
				this.title.innerHTML = options.title;

				this.set_type(options.task._type);

				this.set_period(options.period);

				this.set_responsable(options.task._responsable);

				this.set_link_detail(options.task.id, options.link_detail_text);

				this.parent.style.width = this.parent.clientWidth + 'px';
			}

			// set position
			let position_meta;
			if (target_element instanceof HTMLElement) {
				position_meta = target_element.getBoundingClientRect();
			} else if (target_element instanceof SVGElement) {
				position_meta = options.target_element.getBBox();
			}

			if (options.position === 'left') {
				const left = position_meta.x + (position_meta.width + 10) + 'px';

				this.parent.style.left = left;

				this.pointer.style.transform = 'rotateZ(90deg)';
				this.pointer.style.left = '-7px';
				this.pointer.style.top = '2px';
			}

			const bottom = position_meta.y + this.parent.scrollHeight;

			let top = position_meta.y;

			if (bottom > this.container.scrollHeight) {
				top -= bottom - this.container.scrollHeight + 5;

				this.pointer.style.top = `${bottom - this.container.scrollHeight + 7}px`;
			}

			this.parent.style.top = `${top}px`;

			// show
			this.parent.style.opacity = 1;
			this.parent.style.zIndex = 0;
		}

		set_period(period) {
			this.period.innerHTML = period;
		}

		set_type(type = {}) {
			const { color, name, icon } = type;

			if (name) {
				this.type.style.display = 'inherit';
			} else {
				this.type.style.display = 'none';

				return
			}

			let typeIcon = '';

			if (icon) {
				typeIcon = `<img class="popup-type-icon" src="${icon}" />`;
			} else if (color) {
				typeIcon = `<span class="popup-type-icon" style="background-color:${color}"></span>`;
			}

			this.type.innerHTML = `<span class="popup-type-name">${typeIcon}${name}</span>`;
		}

		set_responsable(responsable = {}) {
			const { name, photo } = responsable;

			if (name) {
				this.responsable.style.display = 'inherit';
			} else {
				this.responsable.style.display = 'none';

				return
			}

			const img = photo
				? `<img class="popup-responsable-icon" src="${photo}" />`
				: '';

			this.responsable.innerHTML = `<span class="popup-responsable-name">${img}${name}</span>`;
		}

		set_link_detail(id, text) {
			this.details.innerHTML = `<span class="link-detail" data-task-id="${id}">${text}</span>`;
		}

		hide() {
			this.parent.style.opacity = 0;
			this.parent.style.left = 0;
			this.parent.style.zIndex = -1;
		}
	}

	class GanttUtilities {
		constructor() {}

		text_ellipsis(el, text, width) {
			if (typeof el.getSubStringLength !== 'undefined') {
				el.innerHTML = text;
				let len = text.length;

				while (el.getSubStringLength(0, len--) > width) {
					el.innerHTML = text.slice(0, len) + '...';
				}
			} else if (typeof el.getComputedTextLength !== 'undefined') {
				while (el.getComputedTextLength() > width) {
					text = text.slice(0, -1);
					el.innerHTML = text + '...';
				}
			} else {
				// the last fallback
				while (el.getBBox().width > width) {
					text = text.slice(0, -1);
					// we need to update the textContent to update the boundary width
					el.innerHTML = text + '...';
				}
			}
		}

		html_avatar(photo, w, y) {
			const avatar = `<img class="avatar" src="${photo}" width="${w}px" height="${y}px" />`;

			return avatar
		}

		generate_id(task) {
			return task.name + '_' + Math.random().toString(36).slice(2, 12)
		}
	}

	class CustomPopup {
		constructor(gantt, parent, container) {
			this.gantt = gantt;
			this.parent = parent;
			this.container = container;
		}

		show(options) {
			if (!options.target_element) {
				throw new Error('target_element is required to show popup')
			}

			this.hide();

			const selector = `div[data-gantt-tooltip-id="${options.task.id}"]`;

			this.tooltip = document.querySelector(selector);

			if (!this.tooltip) return

			let position_meta;

			if (options.target_element instanceof HTMLElement) {
				position_meta = options.target_element.getBoundingClientRect();
			} else if (options.target_element instanceof SVGElement) {
				position_meta = options.target_element.getBBox();
			}

			options.position = options.position || 'left';

			if (options.position === 'left') {
				const left = position_meta.x + (position_meta.width + 10) + 'px';

				this.tooltip.style.left = left;
			}

			const bottom = position_meta.y + this.tooltip.scrollHeight;

			let top = position_meta.y;

			if (bottom > this.container.scrollHeight) {
				top -= bottom - this.container.scrollHeight + 5;
			}

			this.tooltip.style.top = `${top}px`;
			this.tooltip.style.opacity = 1;
			this.tooltip.style.zIndex = 0;
		}

		hide() {
			const tooltips = [...this.parent.children];

			tooltips.forEach(item => {
				item.style.opacity = 0;
				item.style.left = 0;
				item.style.zIndex = -1;
			});
		}
	}

	class Gantt {
		constructor(
			wrapper,
			workItems,
			workItemTypes,
			responsables = [],
			groups = [],
			options
		) {
			this.utilities = new GanttUtilities();

			this.VIEW_MODE = VIEW_MODE;

			this.zoom_size = 0;
			this.zoom_parts = 25;
			this.zoom_normal = 100;

			this.step = 24;
			this.column_width = 38;

			const optionsCopy = options;
			const responsablesCopy = JSON.parse(JSON.stringify(responsables));
			const groupsCopy = JSON.parse(JSON.stringify(groups));
			const workItemTypesCopy = JSON.parse(JSON.stringify(workItemTypes));
			const workItemsCopy = JSON.parse(JSON.stringify(workItems));

			this.setup_wrapper(wrapper);
			this.setup_options(optionsCopy);
			this.setup_responsables(responsablesCopy);
			this.setup_groups(groupsCopy);
			this.setup_workItem_types(workItemTypesCopy);
			this.setup_tasks(workItemsCopy);

			// initialize with default view mode
			this.change_view_mode();
			this.bind_events();
		}

		setup_wrapper(element) {
			let svg_element, wrapper_element;

			// CSS Selector is passed
			if (typeof element === 'string') {
				element = document.querySelector(element);
			}

			// get the SVGElement
			if (element instanceof HTMLElement) {
				wrapper_element = element;
				svg_element = element.querySelector('svg');
			} else if (element instanceof SVGElement) {
				svg_element = element;
			} else {
				throw new TypeError(
					'Simple Gantt only supports usage of a string CSS selector,' +
						" HTML DOM element or SVG DOM element for the 'element' parameter"
				)
			}

			// svg element
			if (!svg_element) {
				// create it
				this.$svg = createSVG('svg', {
					append_to: wrapper_element,
					class: 'gantt-svg',
				});
			} else {
				this.$svg = svg_element;
				this.$svg.classList.add('gantt-svg');
			}

			this.$wrapper = element;

			// wrapper element
			this.$container = document.createElement('div');
			this.$container.classList.add('gantt-container');

			const parent_element = this.$svg.parentElement;
			parent_element.appendChild(this.$container);
			this.$container.appendChild(this.$svg);

			// popup wrapper
			this.popup_wrapper = document.createElement('div');
			this.popup_wrapper.classList.add('popup-wrapper');
			this.$container.appendChild(this.popup_wrapper);
			// popup wrapper
			this.popup_wrapper_custom = document.createElement('div');
			this.popup_wrapper_custom.classList.add('popup-wrapper-custom');
			this.$container.appendChild(this.popup_wrapper_custom);
		}

		setup_options(options) {
			const default_options = {
				header_height: 50,
				view_modes: [...Object.values(VIEW_MODE)],
				bar_height: 20,
				bar_corner_radius: 3,
				arrow_curve: 5,
				padding: 18,
				view_mode: 'Day',
				date_format: 'YYYY-MM-DD',
				popup_trigger: 'click',
				custom_popup_html: null,
				language: 'en',
				margin_bottom: 100,
				disallow_popup: false,
				readonly: false,
				draggable_bar_handles: true,
				hasArrows: true,
				move_dependent: 'left',
				padding_start: null,
				padding_end: null,
				fixed_label_location: false,
				hide_labels: false,
				horizontal_auto_scroll_labels: false,
				draggable_bar: true,
				handle_bar_color: '#752f00',
				handle_progress_color: '#752f00',
				resource_resize_enable: true,
				resource_fixed: false,
				resource_enable: false,
				resource_collapse_enable: false,
				resource_title: 'Tasks',
				resource_width: 250,
				resource_min_width: 220,
				responsables_enable: false,
				responsables_sort_by: 'name',
				responsables_default_name: 'Unassigned',
				groups_enable: false,
				groups_sort_by: 'name',
				workitems_sort_by: 'name',
				workitems_custom_tooltip: false,
				workitems_click_tooltip_open_detail: true,
				new_workitem_enable: false,
				new_workitem_text: 'Create task...',
				rows_alternate_background: true,
				grid_ticks: true,
				bar_color_default: '#FFCC33',
				highlights_weekend: true,
				highlights_past_days: true,
				link_detail_text: 'View details',
				dir_assets: '../dist/assets',
				zoom_max: 5,
			};

			default_options.responsables_default_photo = `${default_options.dir_assets}/responsable-default.png`;

			this.options = Object.assign({}, default_options, options);
		}

		setup_groups(groups) {
			if (this.options.groups_enable) {
				this.groups = groups;

				this.sort_groups();
			} else {
				this.groups = [];
			}
		}

		setup_responsables(responsables) {
			if (this.options.responsables_enable) {
				this.responsables = responsables;

				this.sort_responsables();

				this.responsables.push({
					id: RESPONSABLE_DEFAULT_ID,
					name: this.options.responsables_default_name,
					photo: this.options.responsables_default_photo,
				});
			} else {
				this.responsables = [];
			}
		}

		setup_workItem_types(workItemTypes) {
			// convert workItemTypes array to a dictionary for faster lookups
			this.workItemTypes = workItemTypes.reduce((dict, curr) => {
				dict[curr.id] = curr;

				return dict
			}, {});
		}

		sort_responsables() {
			const { responsables_sort_by } = this.options;

			this.responsables = this.responsables.sort((a, b) => {
				if (a[responsables_sort_by] > b[responsables_sort_by]) return 1

				if (a[responsables_sort_by] < b[responsables_sort_by]) return -1

				return 0
			});
		}

		sort_groups() {
			const { groups_sort_by } = this.options;

			this.groups = this.groups.sort((a, b) => {
				if (a[groups_sort_by] > b[groups_sort_by]) return 1

				if (a[groups_sort_by] < b[groups_sort_by]) return -1

				return 0
			});
		}

		sort_tasks(tasks) {
			const { workitems_sort_by } = this.options;

			return tasks.sort((a, b) => {
				if (a[workitems_sort_by] > b[workitems_sort_by]) return 1

				if (a[workitems_sort_by] < b[workitems_sort_by]) return -1

				return 0
			})
		}

		sort_tasks_by_responsable(tasks) {
			if (!this.options.responsables_enable) {
				return this.sort_tasks(tasks)
			}

			let ordened_tasks = [];

			this.responsables.forEach(item => {
				let list_tasks = tasks.filter(task => task.responsable_id === item.id);

				list_tasks = this.sort_tasks(list_tasks);

				ordened_tasks = [...ordened_tasks, ...list_tasks];
			});

			return ordened_tasks
		}

		sort_tasks_by_groups(tasks) {
			if (!this.options.groups_enable) {
				return this.sort_tasks(tasks)
			}

			let ordened_tasks = [];

			this.groups.forEach(group => {
				let list_tasks = tasks.filter(task => task.group_id === group.id);

				list_tasks = this.sort_tasks(list_tasks);

				ordened_tasks = [...ordened_tasks, ...list_tasks];
			});

			return ordened_tasks
		}

		set_task_index_by_responsable() {
			let index = 0;

			this.resource_tree.forEach(item => {
				if (item.type === DATA_TYPE.RESPONSABLE) {
					index++;
				} else {
					const task = this.get_task(item.task_id);

					task._index = index;

					index++;
				}
			});
		}

		set_task_index_by_groups() {
			let index = 0;

			const { GROUP, SUB_GROUP, NEW_WORKITEM } = DATA_TYPE;

			this.resource_tree.forEach(item => {
				if ([GROUP, SUB_GROUP, NEW_WORKITEM].includes(item.type)) {
					index++;
				} else {
					const task = this.get_task(item.task_id);

					task._index = index;

					index++;
				}
			});
		}

		resource_tree_group_push_new_task(idx, group, sub_group) {
			if (!this.options.new_workitem_enable) return

			this.resource_tree.push({
				type: DATA_TYPE.NEW_WORKITEM,
				group_id: group.id,
				sub_group_id: sub_group ? sub_group.id : null,
				idx,
			});
		}

		resource_tree_group_push_task(group, sub_group) {
			let tasks = [...this.tasks];

			if (group) {
				tasks = tasks.filter(task => task.group_id === group.id);
			}

			if (sub_group) {
				tasks = tasks.filter(task => task.sub_group_id === sub_group.id);
			}

			tasks.forEach(task => {
				this.resource_tree.push({
					type: 'task',
					task_id: task.id,
					group_id: group.id,
					sub_group_id: sub_group ? sub_group.id : null,
				});
			});
		}

		set_resource_tree() {
			const { responsables_enable, groups_enable } = this.options;

			this.resource_tree = [];

			if (!responsables_enable && !groups_enable) {
				this.resource_tree = this.tasks.map(task => ({
					type: 'task',
					task_id: task.id,
				}));

				return
			}

			if (groups_enable) {
				this.groups.forEach(group => {
					this.resource_tree.push({
						type: DATA_TYPE.GROUP,
						group_id: group.id,
						group_name: group.name,
						group_icon: group.icon,
						color: group.color,
					});

					if (group.sub_group) {
						group.sub_group.forEach(sg => {
							this.resource_tree.push({
								type: DATA_TYPE.SUB_GROUP,
								sub_group_id: sg.id,
								sub_group_name: sg.name,
								sub_group_icon: sg.icon,
								color: sg.color,
								group_id: group.id,
							});

							this.resource_tree_group_push_task(group, sg);

							this.resource_tree_group_push_new_task(
								this.resource_tree.length,
								group,
								sg
							);
						});
					} else {
						group.sub_group = [];

						this.resource_tree_group_push_task(group);

						this.resource_tree_group_push_new_task(
							this.resource_tree.length,
							group
						);
					}
				});

				return
			}

			this.responsables.forEach(responsable => {
				this.resource_tree.push({
					type: DATA_TYPE.RESPONSABLE,
					responsable_id: responsable.id,
					responsable_name: responsable.name,
					responsable_photo: responsable.photo,
				});

				this.tasks
					.filter(task => task.responsable_id === responsable.id)
					.forEach(task => {
						this.resource_tree.push({
							type: 'task',
							task_id: task.id,
							responsable_id: responsable.id,
						});
					});
			});
		}

		setup_tasks(tasks) {
			this.task_map = {};

			// prepare tasks
			const tasks_map = tasks.map((task, i) => {
				// convert to Date objects
				task._start = utils.parse(task.start);
				task._end = utils.parse(task.end);

				// make task invalid if duration too large
				if (utils.diff(task._end, task._start, 'year') > 10) {
					task.end = null;
				}

				// cache index
				task._index = i;

				// invalid dates
				if (!task.start && !task.end) {
					const today = utils.today();
					task._start = today;
					task._end = utils.add(today, 2, 'day');
				}

				if (!task.start && task.end) {
					task._start = utils.add(task._end, -2, 'day');
				}

				if (task.start && !task.end && task.duration) {
					task._end = utils.add(task._start, task.duration, 'day');
				} else if (task.start && !task.end) {
					task._end = utils.add(task._start, 2, 'day');
				}

				// if hours is not set, assume the last day is full day
				// e.g: 2018-09-09 becomes 2018-09-09 23:59:59
				// const task_end_values = date_utils.get_date_values(task._end)
				// if (task_end_values.slice(3).every(d => d === 0)) {
				// 	task._end = date_utils.add(task._end, 24, 'hour')
				// }

				// invalid flag
				if (!task.start || (!task.end && !task.duration)) {
					task.invalid = true;
				}

				// dependencies
				if (typeof task.dependencies === 'string' || !task.dependencies) {
					let deps = [];

					if (task.dependencies) {
						deps = task.dependencies
							.split(',')
							.map(d => d.trim())
							.filter(d => d);
					}

					task.dependencies = deps;
				}

				// uids
				if (!task.id) {
					throw new TypeError('The task id is invalid!')
				}

				// workItem types
				if (
					typeof task.type_id !== 'undefined' &&
					this.workItemTypes.hasOwnProperty(task.type_id)
				) {
					task._type = this.workItemTypes[task.type_id];
				}

				// workItem responsable
				if (
					typeof task.responsable_id !== 'undefined' &&
					this.responsables.hasOwnProperty(task.responsable_id)
				) {
					task._responsable = this.responsables.find(
						item => item.id === task.responsable_id
					);
				}

				if (!task._responsable) {
					task.responsable_id = RESPONSABLE_DEFAULT_ID;
					task._responsable = this.responsables[this.responsables.length - 1];
				}

				// workItem groups
				if (
					typeof task.group_id !== 'undefined' &&
					this.groups.hasOwnProperty(task.group_id)
				) {
					task._group = this.groups.find(item => item.id === task.group_id);
				}

				this.task_map[task.id] = task;

				return task
			});

			if (this.options.groups_enable) {
				this.tasks = this.sort_tasks_by_groups(tasks_map);
			} else {
				this.tasks = this.sort_tasks_by_responsable(tasks_map);
			}

			this.set_resource_tree();

			if (this.options.groups_enable) {
				this.set_task_index_by_groups();
			} else {
				this.set_task_index_by_responsable();
			}

			this.setup_dependencies();
		}

		setup_dependencies() {
			this.dependency_map = {};

			for (let t of this.tasks) {
				for (let d of t.dependencies) {
					this.dependency_map[d] = this.dependency_map[d] || [];
					this.dependency_map[d].push(t.id);
				}
			}
		}

		refresh(tasks) {
			this.setup_tasks(tasks);
			this.change_view_mode();
		}

		change_view_mode(mode = this.options.view_mode) {
			this.zoom_reset_size();
			this.update_view_scale(mode);
			this.setup_dates();
			this.render();
			this.trigger_event('view_change', [mode]);
		}

		fullscreen(active = true) {
			if (active) {
				this.$wrapper.classList.add('gantt-fullscreen');
			} else {
				this.$wrapper.classList.remove('gantt-fullscreen');
			}
		}

		zoom() {
			let percent = this.zoom_parts / 100;
			percent *= this.zoom_size;
			percent += 1;

			this.column_width = this.column_width_original * percent;

			this.setup_dates();
			this.render();
		}

		zoom_reset_size() {
			this.zoom_size = 0;
		}

		zoom_reset() {
			if (this.zoom_size !== 0) {
				this.zoom_reset_size();

				this.zoom();
			}
		}

		zoom_in() {
			if (this.zoom_size < this.options.zoom_max) {
				this.zoom_size++;

				this.zoom();
			}
		}

		zoom_percent(percent) {
			this.zoom_size = parseInt(percent, 10) / this.zoom_parts - 4;

			this.zoom();
		}

		zoom_out() {
			if (this.zoom_size > 0) {
				this.zoom_size--;

				this.zoom();
			}
		}

		update_view_scale(view_mode) {
			this.options.view_mode = view_mode;

			if (view_mode === VIEW_MODE.HOUR) {
				this.step = 24 / 24;
				this.column_width = 50;
			} else if (view_mode === VIEW_MODE.DAY) {
				this.step = 24;
				this.column_width = 100;
			} else if (view_mode === VIEW_MODE.HALF_DAY) {
				this.step = 24 / 2;
				this.column_width = 100;
			} else if (view_mode === VIEW_MODE.QUARTER_DAY) {
				this.step = 24 / 4;
				this.column_width = 100;
			} else if (view_mode === VIEW_MODE.WEEK) {
				this.step = 24 * 7;
				this.column_width = 200;
			} else if (view_mode === VIEW_MODE.MONTH) {
				this.step = 24 * 30;
				this.column_width = 300;
			} else if (view_mode === VIEW_MODE.YEAR) {
				this.step = 24 * 365;
				this.column_width = 400;
			}

			this.column_width_original = this.column_width;
		}

		setup_dates() {
			this.setup_gantt_dates();
			this.setup_date_values();
		}

		setup_gantt_dates() {
			this.gantt_start = this.gantt_end = null;

			for (let task of this.tasks) {
				if (!this.gantt_start || task._start < this.gantt_start) {
					this.gantt_start = task._start;
				}

				if (!this.gantt_end || task._end > this.gantt_end) {
					this.gantt_end = task._end;
				}
			}

			if (!this.tasks.length) {
				this.gantt_start = this.gantt_end = new Date();
			}

			this.gantt_start = utils.start_of(this.gantt_start, 'day');
			this.gantt_end = utils.start_of(this.gantt_end, 'day');

			const padd_start = this.options.padding_start || this.default_padding();
			const padd_end = this.options.padding_end || this.default_padding();

			const { HOUR, QUARTER_DAY, HALF_DAY, DAY, WEEK, MONTH, YEAR } = VIEW_MODE;

			if (this.view_is([HOUR, QUARTER_DAY, HALF_DAY, DAY])) {
				this.gantt_start = utils.add(this.gantt_start, -padd_start, 'day');

				this.gantt_end = utils.add(this.gantt_end, padd_end, 'day');
			} else if (this.view_is(WEEK)) {
				this.gantt_start = utils.add(
					this.gantt_start,
					-(padd_start * 7),
					'day'
				);

				this.gantt_end = utils.add(this.gantt_end, padd_end * 7, 'day');
			} else if (this.view_is(MONTH)) {
				this.gantt_start = utils.add(this.gantt_start, -padd_start, 'month');

				this.gantt_end = utils.add(this.gantt_end, padd_end, 'month');
			} else if (this.view_is(YEAR)) {
				this.gantt_start = utils.add(this.gantt_start, -padd_start, 'year');

				this.gantt_end = utils.add(this.gantt_end, padd_end, 'year');
			}
		}

		default_padding() {
			const { QUARTER_DAY, HALF_DAY, DAY, WEEK, MONTH, YEAR } = VIEW_MODE;

			if (this.view_is([QUARTER_DAY, HALF_DAY, DAY])) {
				return 14
			} else if (this.view_is(WEEK)) {
				return 5
			} else if (this.view_is(MONTH)) {
				return 6
			} else if (this.view_is(YEAR)) {
				return 3
			} else {
				return 6
			}
		}

		setup_date_values() {
			this.dates = [];
			let cur_date = null;

			while (cur_date === null || cur_date < this.gantt_end) {
				if (!cur_date) {
					cur_date = utils.clone(this.gantt_start);
				} else {
					if (this.view_is(VIEW_MODE.YEAR)) {
						cur_date = utils.add(cur_date, 1, 'year');
					} else if (this.view_is(VIEW_MODE.MONTH)) {
						cur_date = utils.add(cur_date, 1, 'month');
					} else {
						cur_date = utils.add(cur_date, this.step, 'hour');
					}
				}

				this.dates.push(cur_date);
			}
		}

		bind_events() {
			this.bind_grid_events();
			this.bind_bar_events();
			this.bind_resource_events();
		}

		render() {
			this.clear();
			this.setup_layers();
			this.make_resource();
			this.make_grid();
			this.make_dates();
			this.make_bars();
			this.make_arrows();
			this.map_arrows_on_bars();
			this.set_width();
			this.set_scroll_position();
		}

		setup_layers() {
			this.layers = {};

			const layers = [
				'grid',
				'arrow',
				'progress',
				'bar',
				'details',
				'date',
				'resource_bg',
				'resource',
				'resource_title',
			];

			for (let layer of layers) {
				this.layers[layer] = createSVG('g', {
					class: layer,
					append_to: this.$svg,
				});
			}
		}

		make_resource() {
			const {
				resource_enable,
				resource_width,
				resource_title,
				resource_resize_enable,
				header_height,
				padding,
			} = this.options;

			this.resource_width = 0;

			if (!resource_enable) return

			const row_width = resource_width;
			const row_height = this.get_rows_height();

			this.resource_grid_layer = [];
			this.resource_line_grid_layer = [];
			this.resource_item_title_list = [];
			this.resource_width = resource_width;

			const grid_layer = createSVG('g', { append_to: this.layers.resource });
			const text_layer = createSVG('g', { append_to: this.layers.resource });
			const lines_layer = createSVG('g', { append_to: this.layers.resource });

			let row_y = header_height + padding / 2;

			this.resource_background_clip = createSVG('clipPath', {
				id: 'clip-resource-background',
				append_to: this.layers.resource,
			});

			this.resource_background_r_clip = createSVG('rect', {
				x: 1,
				y: 1,
				width: row_width,
				height: '100%',
				class: 'resource-background',
				append_to: this.resource_background_clip,
			});

			this.resource_background = createSVG('rect', {
				x: 1,
				y: 1,
				width: row_width,
				height: '100%',
				class: 'resource-background',
				append_to: this.layers.resource_bg,
			});

			this.resource_header = createSVG('g', {
				append_to: this.layers.resource_title,
			});

			this.resource_header_row = createSVG('rect', {
				x: 0,
				y: 0,
				width: row_width,
				height: row_height + header_height - 30,
				class: 'resource-header-row',
				append_to: this.resource_header,
			});

			this.resource_header_line = createSVG('rect', {
				x: 0,
				y: row_height + header_height - 30,
				width: row_width,
				height: 1,
				class: 'resource-header-line',
				append_to: this.resource_header,
			});

			this.resource_header_text = createSVG('text', {
				x: 20,
				y: row_y - 31,
				width: row_width,
				height: row_height,
				innerHTML: resource_title,
				class: 'resource-header-text',
				append_to: this.resource_header,
				clipPath: 'clip-resource-background',
			});

			this.resource_line = createSVG('rect', {
				x: row_width,
				y: 0,
				width: 1,
				height: '100%',
				class: `resource-line ${resource_resize_enable ? 'resource-resize' : ''}`,
				append_to: this.resource_header,
			});

			this.resource_tree.forEach(tree => {
				let item;

				if (tree.type === DATA_TYPE.GROUP) {
					item = {
						type: DATA_TYPE.GROUP,
						name: tree.group_name,
						icon: tree.group_icon,
						color: tree.color,
						group_id: tree.group_id,
					};
				} else if (tree.type === DATA_TYPE.SUB_GROUP) {
					item = {
						type: DATA_TYPE.SUB_GROUP,
						name: tree.sub_group_name,
						icon: tree.sub_group_icon,
						color: tree.color,
						sub_group_id: tree.sub_group_id,
						group_id: tree.group_id,
					};
				} else if (tree.type === DATA_TYPE.RESPONSABLE) {
					item = {
						type: DATA_TYPE.RESPONSABLE,
						name: tree.responsable_name,
						photo: tree.responsable_photo,
						responsable_id: tree.responsable_id,
					};
				} else if (tree.type === DATA_TYPE.NEW_WORKITEM) {
					item = {
						type: DATA_TYPE.NEW_WORKITEM,
						name: this.options.new_workitem_text,
						sub_group_id: tree.sub_group_id,
						group_id: tree.group_id,
						idx: tree.idx,
					};
				} else {
					item = this.get_task(tree.task_id);
				}

				const resource_text_item = createSVG('g', {
					append_to: text_layer,
					class: 'resource-text-item',
				});

				this.make_resource_text(
					item,
					row_y,
					row_width,
					row_height,
					resource_text_item
				);

				const task_grid_layer = createSVG('rect', {
					x: 0,
					y: row_y,
					width: row_width,
					height: row_height,
					append_to: grid_layer,
				});

				const line_grid_layer = createSVG('line', {
					x1: 0,
					y1: row_y + row_height,
					x2: row_width,
					y2: row_y + row_height,
					class: 'row-line',
					append_to: lines_layer,
				});

				this.resource_grid_layer.push(task_grid_layer);
				this.resource_line_grid_layer.push(line_grid_layer);

				row_y += this.get_rows_height();
			});
		}

		make_resource_text(item, row_y, row_width, row_height, el_parent) {
			const { responsables_enable, groups_enable, resource_collapse_enable } =
				this.options;

			let elY = row_y + row_height / 2 + 2;
			let elX = 10;
			let padding = 30;
			let item_title_css = 'resource-text ';

			el_parent.setAttribute(DATA_ATTR.OPEN, DATA_OPEN.OPEN);

			if (groups_enable && item.type === DATA_TYPE.GROUP) {
				if (resource_collapse_enable) {
					this.make_resource_icon_color(item, el_parent, elY - 14, 22, 25);

					this.make_resource_arrow(item, el_parent, elY, 6, 12);

					elX += 12;
					padding += 14;
				} else {
					this.make_resource_icon_color(item, el_parent, elY - 14, 10, 25);
				}

				if (item.icon || item.color) {
					elX += 30;
					padding += 22;
				}

				elY += 3;
				item_title_css += '-group';

				el_parent.setAttribute(DATA_ATTR.TYPE, DATA_TYPE.GROUP);
			} else if (groups_enable && item.type === DATA_TYPE.SUB_GROUP) {
				if (resource_collapse_enable) {
					this.make_resource_icon_color(item, el_parent, elY - 10, 30, 18);

					this.make_resource_arrow(item, el_parent, elY, 14, 12);

					elX += 16;
					padding += 18;
				} else {
					this.make_resource_icon_color(item, el_parent, elY - 10, 18, 18);
				}

				if (item.icon || item.color) {
					elX += 30;
					padding += 22;
				} else {
					elX += 4;
				}

				elY += 3;
				item_title_css += '-sub-group';

				el_parent.setAttribute(DATA_ATTR.TYPE, DATA_TYPE.SUB_GROUP);
				el_parent.setAttribute(DATA_ATTR.TYPE_PARENT, DATA_TYPE.GROUP);
			} else if (responsables_enable && item.type === DATA_TYPE.RESPONSABLE) {
				this.make_resource_responsable_photo(
					item.photo,
					el_parent,
					elY - 14,
					8,
					25
				);

				elX += 30;
				elY += 3;
				padding += 22;
				item_title_css += '-responsable';

				el_parent.setAttribute(DATA_ATTR.TYPE, DATA_TYPE.RESPONSABLE);
			} else if (item.type === DATA_TYPE.NEW_WORKITEM) {
				elX += 20;
				padding += 20;

				const i = `<i class="fa fa-plus" aria-hidden="true"></i>`;
				const label = `<label class="new-workitem" for="new-workitem-${item.idx}">${i}</label>`;

				createSVG('foreignObject', {
					x: elX,
					y: elY - 13,
					width: 16,
					height: 16,
					append_to: el_parent,
					innerHTML: label,
				});

				if (item.sub_group_id) {
					elX += 20;
					padding += 20;
				} else if (item.group_id) {
					elX += 20;
					padding += 20;
				}
			} else {
				item_title_css += '-task';

				if (responsables_enable || groups_enable) {
					elX += 20;
					padding += 20;
				}

				if (groups_enable && responsables_enable) {
					this.make_resource_responsable_photo(
						item._responsable.photo,
						el_parent,
						elY - 14,
						30,
						21
					);

					elY += 2;
					elX += 26;
					padding += 25;
				}

				const type = this.workItemTypes[item.type_id];

				if (type) {
					this.make_resource_workitem_type(type, el_parent, elY - 12, elX, 14);

					elX += 20;
					padding += 20;
				}

				el_parent.setAttribute(DATA_ATTR.TYPE, DATA_TYPE.WORKITEM);
				el_parent.setAttribute(DATA_ATTR.ID, item.id);

				if (item.group_id && item.sub_group_id) {
					el_parent.setAttribute(DATA_ATTR.TYPE_PARENT, DATA_TYPE.SUB_GROUP);
				} else {
					el_parent.setAttribute(DATA_ATTR.TYPE_PARENT, DATA_TYPE.GROUP);
				}
			}

			let element;

			if (item.type === DATA_TYPE.NEW_WORKITEM) {
				const width = this.options.resource_min_width - 60;

				const attr_id = `id="new-workitem-${item.idx}"`;
				const attr_group = item.group_id ? `data-group="${item.group_id}"` : '';
				const attr_sub_group = item.sub_group_id
					? `data-sub-group="${item.sub_group_id}"`
					: '';

				element = createSVG('foreignObject', {
					x: elX,
					y: elY - 13,
					width: row_width,
					height: 16,
					append_to: el_parent,
					innerHTML: `<input ${attr_id} ${attr_group} ${attr_sub_group} type="text" class="new-workitem" placeholder="${item.name}" style="width:${width}px" />`,
				});
			} else {
				element = createSVG('text', {
					x: elX,
					y: elY,
					[DATA_ATTR.ID]: item.id || '',
					[DATA_ATTR.GROUP_ID]: item.group_id || '',
					[DATA_ATTR.SUB_GROUP_ID]: item.sub_group_id || '',
					class: item_title_css,
					append_to: el_parent,
					clipPath: 'clip-resource-background',
				});

				this.utilities.text_ellipsis(element, item.name, row_width - padding);
			}

			this.resource_item_title_list.push({
				element,
				row_width,
				padding,
				name: item.name,
				type: item.type,
			});
		}

		make_resource_responsable_photo(photo, el_parent, elY, elX, img_wh) {
			if (!photo) return

			createSVG('foreignObject', {
				x: elX,
				y: elY,
				width: img_wh,
				height: img_wh,
				append_to: el_parent,
				innerHTML: this.utilities.html_avatar(photo, img_wh, img_wh),
			});
		}

		make_resource_icon_color(item, el_parent, elY, elX, img_wh) {
			if (item.icon) {
				createSVG('foreignObject', {
					x: elX,
					y: elY,
					width: img_wh,
					height: img_wh,
					append_to: el_parent,
					[DATA_ATTR.ID]: item.id || '',
					[DATA_ATTR.GROUP_ID]: item.group_id || '',
					[DATA_ATTR.SUB_GROUP_ID]: item.sub_group_id || '',
					class: this.options.resource_collapse_enable ? 'resource-pointer' : '',
					innerHTML: this.utilities.html_avatar(item.icon, img_wh, img_wh),
				});
			} else if (item.color) {
				createSVG('rect', {
					x: elX,
					y: elY,
					rx: img_wh,
					ry: img_wh,
					width: img_wh,
					height: img_wh,
					[DATA_ATTR.ID]: item.id || '',
					[DATA_ATTR.GROUP_ID]: item.group_id || '',
					[DATA_ATTR.SUB_GROUP_ID]: item.sub_group_id || '',
					style: `fill:${item.color || '#000000'}`,
					class: this.options.resource_collapse_enable ? 'resource-pointer' : '',
					append_to: el_parent,
				});
			}
		}

		make_resource_arrow(item, el_parent, elY, elX, img_wh) {
			if (!this.options.resource_collapse_enable) return

			createSVG('image', {
				x: elX,
				y: elY - 7,
				width: img_wh,
				height: img_wh,
				append_to: el_parent,
				[DATA_ATTR.ID]: item.id || '',
				[DATA_ATTR.GROUP_ID]: item.group_id || '',
				[DATA_ATTR.SUB_GROUP_ID]: item.sub_group_id || '',
				class: 'resource-pointer resource-arrow',
				href: `${this.options.dir_assets}/angle-down-solid.svg`,
			});
		}

		make_resource_workitem_type(type, el_parent, elY, elX, img_wh) {
			let tag;
			let x = elX;
			let y = elY;
			let w = img_wh;
			let h = img_wh;

			if (type.imageIcon) {
				tag = `<img title="${type.name}" src="${type.imageIcon}" class="resource-type-icon -img" />`;
			} else if (type.fontIcon) {
				tag = `<i title="${type.name}" class="resource-type-icon -font ${type.fontIcon} icon"></i>`;

				x += 2;
				y += 2;
				w += 4;
				h += 4;
			} else if (type.color) {
				const style = `style="background:${type.color || '#000000'}"`;
				tag = `<spam title="${type.name}" class="resource-type-icon -color" ${style}></spam>`;
			}

			if (!tag) return

			createSVG('foreignObject', {
				x,
				y,
				width: w,
				height: h,
				append_to: el_parent,
				innerHTML: tag,
			});
		}

		make_grid() {
			this.make_grid_background();
			this.make_grid_header();
			this.make_grid_highlights();
			this.make_grid_rows();
			this.make_grid_ticks();
		}

		make_grid_background() {
			const grid_width =
				this.resource_width + this.dates.length * this.column_width;

			const bar_height_padding = this.get_rows_height();

			const grid_height =
				this.options.header_height +
				this.options.padding +
				bar_height_padding * this.resource_tree.length;

			createSVG('rect', {
				x: 0,
				y: 0,
				width: grid_width,
				height: grid_height,
				class: 'grid-background',
				append_to: this.layers.grid,
			});

			const space_height = this.options.padding + this.options.margin_bottom;

			$.attr(this.$svg, {
				height: grid_height + space_height,
				width: grid_width,
			});
		}

		make_grid_rows() {
			const { header_height, bar_height, padding, rows_alternate_background } =
				this.options;

			const rows_layer = createSVG('g', { append_to: this.layers.grid });
			const lines_layer = createSVG('g', { append_to: this.layers.grid });

			const row_width =
				this.resource_width + this.dates.length * this.column_width;

			const row_height = bar_height + padding;

			const total_rows = this.resource_tree.length;

			let row_y = header_height + padding / 2;

			const grid_row_class = rows_alternate_background
				? 'grid-row -alt-bg'
				: 'grid-row';

			for (let i = 0; i < total_rows; i++) {
				createSVG('rect', {
					x: 0,
					y: row_y,
					width: row_width,
					height: row_height,
					class: grid_row_class,
					append_to: rows_layer,
				});

				createSVG('line', {
					x1: 0,
					y1: row_y + row_height,
					x2: row_width,
					y2: row_y + row_height,
					class: 'row-line',
					append_to: lines_layer,
				});

				row_y += row_height;
			}
		}

		make_grid_header() {
			const header_width =
				this.resource_width + this.dates.length * this.column_width;

			const header_height = this.options.header_height + 10;

			createSVG('rect', {
				x: 0,
				y: 0,
				width: header_width,
				height: header_height,
				class: 'grid-header',
				append_to: this.layers.date,
			});
		}

		make_grid_ticks() {
			if (!this.options.grid_ticks) return

			let tick_x = this.resource_width;
			let tick_y = this.options.header_height + this.options.padding / 2;
			let tick_height = this.get_rows_height() * this.resource_tree.length;

			this.grid_ticks = [];

			const grid_ticks_g = createSVG('g', { append_to: this.layers.grid });

			for (let date of this.dates) {
				let width = 0.2;

				if (this.view_is(VIEW_MODE.DAY) && date.getDate() === 1) {
					width = 0.4;
				}

				if (
					this.view_is(VIEW_MODE.WEEK) &&
					date.getDate() >= 1 &&
					date.getDate() < 8
				) {
					width = 0.4;
				}

				if (this.view_is(VIEW_MODE.MONTH) && (date.getMonth() + 1) % 3 === 0) {
					width = 0.4;
				}

				const grid_tick = createSVG('rect', {
					x: tick_x,
					y: tick_y,
					height: tick_height,
					width: width,
					class: 'tick',
					append_to: grid_ticks_g,
				});

				this.grid_ticks.push(grid_tick);

				if (this.view_is(VIEW_MODE.MONTH)) {
					tick_x += (utils.get_days_in_month(date) * this.column_width) / 30;
				} else {
					tick_x += this.column_width;
				}
			}
		}

		make_grid_highlights() {
			if (!this.view_is(VIEW_MODE.DAY)) return

			const {
				padding,
				header_height,
				bar_height,
				highlights_weekend,
				highlights_past_days,
			} = this.options;

			let resource_width = 0;

			if (this.options.resource_enable) {
				resource_width = this.options.resource_width;
			}

			const today = utils.today();
			const diff = utils.diff(today, this.gantt_start, 'hour');
			const column_start = (diff / this.step) * this.column_width + resource_width;
			const x = column_start + this.column_width / 2 - 1;

			const height =
				(bar_height + padding) * this.resource_tree.length +
				header_height +
				padding / 2;

			this.today_highlight_line_1 = createSVG('rect', {
				x,
				y: header_height + 8,
				height: height - header_height,
				width: 2,
				class: 'today-highlight -col',
				append_to: this.layers.date,
			});

			this.today_highlight_line_2 = createSVG('rect', {
				x: column_start,
				y: header_height + 8,
				height: 2,
				width: this.column_width,
				class: 'today-highlight',
				append_to: this.layers.date,
			});

			if (highlights_past_days) {
				this.make_grid_highlights_past_days(this.column_width, resource_width);
			}

			if (highlights_weekend) {
				this.make_grid_highlights_weekend(this.column_width, resource_width);
			}
		}

		make_grid_highlights_weekend(column_width, resource_width) {
			const start = this.gantt_start;
			const end = this.gantt_end;
			const total = utils.diff(end, start, 'day');
			let now = utils.clone(start);
			let index = 0;

			this.grid_highlights_weekend = [];

			while (index < total) {
				now = utils.add(now, 1, 'day');

				if (now.getDay() === 6) {
					const colX = column_width * (index + 1);

					const element = createSVG('rect', {
						x: colX + resource_width,
						y: 0,
						height: '100%',
						width: column_width * 2,
						class: 'weekend-highlight',
						append_to: this.layers.grid,
					});

					this.grid_highlights_weekend.push(element);
				}

				index++;
			}
		}

		make_grid_highlights_past_days(column_width, resource_width) {
			const today = utils.today();
			const diff = utils.diff(today, this.gantt_start, 'day');

			this.grid_highlights_past_days = createSVG('rect', {
				x: resource_width,
				y: 0,
				height: '100%',
				width: column_width * diff,
				class: 'past-days-highlight',
				append_to: this.layers.grid,
			});
		}

		make_dates() {
			this.text_dates = [];
			this.text_dates_upper = [];

			for (let date of this.get_dates_to_draw()) {
				const text_date = createSVG('text', {
					x: this.resource_width + date.lower_x,
					y: date.lower_y,
					innerHTML: date.lower_text,
					class: 'lower-text',
					append_to: this.layers.date,
				});

				this.text_dates.push(text_date);

				if (date.upper_text) {
					const text_date_upper = createSVG('text', {
						x: this.resource_width + date.upper_x,
						y: date.upper_y,
						innerHTML: date.upper_text,
						class: 'upper-text',
						append_to: this.layers.date,
					});

					if (text_date_upper.getBBox().x2 > this.layers.grid.getBBox().width) {
						text_date_upper.remove();
					} else {
						this.text_dates_upper.push(text_date_upper);
					}
				}
			}
		}

		get_dates_to_draw() {
			let last_date = null;

			const monthPerYears = {};

			if (this.options.view_mode === VIEW_MODE.MONTH) {
				this.dates.forEach(date => {
					if (monthPerYears[date.getFullYear()]) {
						monthPerYears[date.getFullYear()] += 1;
					} else {
						monthPerYears[date.getFullYear()] = 1;
					}
				});
			}

			const dates = this.dates.map((date, i) => {
				const d = this.get_date_info(date, last_date, i, monthPerYears);

				last_date = date;

				return d
			});

			return dates
		}

		get_date_info(date, last_date, i, monthPerYears) {
			if (!last_date) {
				last_date = utils.add(date, 1, 'year');
			}

			const date_text = {
				Hour_lower: utils.format(date, 'HH', this.options.language),
				'Quarter Day_lower': utils.format(date, 'HH', this.options.language),
				'Half Day_lower': utils.format(date, 'HH', this.options.language),
				Day_lower:
					date.getDate() !== last_date.getDate()
						? utils.format(date, 'D ddd', this.options.language)
						: '',
				Week_lower:
					date.getMonth() !== last_date.getMonth()
						? utils.format(date, 'D MMM', this.options.language)
						: utils.format(date, 'D', this.options.language),
				Month_lower: utils.format(date, 'MMMM', this.options.language),
				Year_lower: utils.format(date, 'YYYY', this.options.language),
				Hour_upper:
					date.getDate() !== last_date.getDate()
						? utils.format(date, 'D MMM', this.options.language)
						: '',
				'Quarter Day_upper':
					date.getDate() !== last_date.getDate()
						? utils.format(date, 'D MMM YYYY', this.options.language)
						: '',
				'Half Day_upper':
					date.getDate() !== last_date.getDate()
						? date.getMonth() !== last_date.getMonth()
							? utils.format(date, 'D MMM YYYY', this.options.language)
							: utils.format(date, 'D ddd', this.options.language)
						: '',
				Day_upper:
					date.getMonth() !== last_date.getMonth()
						? utils.format(date, 'MMMM YYYY', this.options.language)
						: '',
				Week_upper:
					date.getMonth() !== last_date.getMonth()
						? utils.format(date, `MMMM YYYY`, this.options.language)
						: '',
				Month_upper:
					date.getFullYear() !== last_date.getFullYear()
						? utils.format(date, 'YYYY', this.options.language)
						: '',
				Year_upper:
					date.getFullYear() !== last_date.getFullYear()
						? utils.format(date, 'YYYY', this.options.language)
						: '',
			};

			const base_pos = {
				x: i * this.column_width,
				lower_y: this.options.header_height,
				upper_y: this.options.header_height - 25,
			};

			const x_pos = {
				Hour_lower: 0,
				Hour_upper: (this.column_width * 24) / 2,
				'Quarter Day_lower': 0,
				'Quarter Day_upper': (this.column_width * 4) / 2,
				'Half Day_lower': 0,
				'Half Day_upper': (this.column_width * 2) / 2,
				Day_lower: this.column_width / 2,
				Day_upper: (this.column_width * 30) / 2,
				Week_lower: 0,
				Week_upper: (this.column_width * 4) / 2,
				Month_lower: this.column_width / 2,
				Month_upper: (this.column_width * monthPerYears[date.getFullYear()]) / 2,
				Year_lower: this.column_width / 2,
				Year_upper: (this.column_width * 30) / 2,
			};

			return {
				upper_text: date_text[`${this.options.view_mode}_upper`],
				lower_text: date_text[`${this.options.view_mode}_lower`],
				upper_x: base_pos.x + x_pos[`${this.options.view_mode}_upper`],
				upper_y: base_pos.upper_y,
				lower_x: base_pos.x + x_pos[`${this.options.view_mode}_lower`],
				lower_y: base_pos.lower_y,
			}
		}

		make_bars() {
			this.bar_map = {};

			this.bars = this.tasks.map(task => {
				const bar = new Bar(this, task, this.resource_width);

				this.layers.bar.appendChild(bar.group);

				this.bar_map[task.id] = bar;

				return bar
			});
		}

		make_arrows() {
			this.arrows = [];

			if (!this.options.hasArrows) return

			for (let task of this.tasks) {
				let arrows = [];

				arrows = task.dependencies
					.map(task_id => {
						const dependency = this.get_task(task_id);

						if (!dependency) return

						const from_task = this.get_bar(dependency.id);

						const to_task = this.get_bar(task.id);

						if (!from_task || !to_task) return

						const arrow = new Arrow(this, from_task, to_task);

						this.layers.arrow.appendChild(arrow.element);

						return arrow
					})
					.filter(Boolean); // filter falsy values

				this.arrows = this.arrows.concat(arrows);
			}
		}

		update_position_bars(x) {
			let posX = x - this.resource_width;
			posX -= this.last_resource_pos_x;

			this.bars.forEach(bar => {
				bar.update_bar_position({
					x: bar.$bar.getX() + posX,
				});
			});
		}

		remake_arrows() {
			this.arrows = [];
			this.layers.arrow.innerHTML = '';

			this.make_arrows();
			this.map_arrows_on_bars();
		}

		map_arrows_on_bars() {
			if (!this.options.hasArrows) return

			for (let task_id in this.bar_map) {
				const bar = this.get_bar(task_id);

				bar.arrows = this.arrows.filter(
					arrow =>
						arrow.from_task.task.id === bar.task.id ||
						arrow.to_task.task.id === bar.task.id
				);
			}
		}

		set_width() {
			const actual_width = this.$svg.querySelector('.grid .grid-row')
				? this.$svg.querySelector('.grid .grid-row').getAttribute('width')
				: 0;

			this.$svg.setAttribute('width', actual_width);
		}

		set_scroll_position() {
			const parent_element = this.$svg.parentElement;

			if (!parent_element) return

			const hours_before_first_task = utils.diff(
				this.get_oldest_starting_date(),
				this.gantt_start,
				'hour'
			);

			const scroll_pos =
				(hours_before_first_task / this.step) * this.column_width -
				this.column_width;

			parent_element.scrollLeft = scroll_pos;
		}

		scrolling_today() {
			const dateChilds = [...this.layers.date.children];
			const th = 'today-highlight';
			const today = dateChilds.find(item => item.getAttribute('class') === th);

			if (!today) return

			const posX = today.getX();

			if (!posX) return

			const colsWidth = this.column_width * 2;
			const clientWidth = this.$container.clientWidth / 2;
			const width = clientWidth + this.resource_width - colsWidth;
			const left = posX - width;
			const top = this.$container.scrollTop;

			this.$container.scrollTo(left, top);
		}

		bind_grid_events() {
			const elements = [
				'.gantt-svg .grid',
				'.gantt-svg .grid-row',
				'.gantt-svg .weekend-highlight',
				'.gantt-svg .past-days-highlight',
				'.gantt-svg .arrow path',
				'.gantt-svg .row-line',
				'.gantt-svg .tick',
			];

			let scrolling_active = false;
			let x_on_start;
			let y_on_start;
			let left;
			let top;

			$.on(this.$svg, this.options.popup_trigger, elements, () => {
				this.unselect_all();
				this.hide_popup();
			});

			$.on(this.$container, 'mousedown', elements, e => {
				scrolling_active = true;

				x_on_start = e.clientX;
				y_on_start = e.clientY;

				left = this.$container.scrollLeft;
				top = this.$container.scrollTop;

				this.unselect_all();
				this.hide_popup();
			});

			$.on(this.$container, 'mousemove', elements, e => {
				if (!scrolling_active) return

				const dx = e.clientX - x_on_start;
				const dy = e.clientY - y_on_start;

				this.$container.scrollTo(left - dx, top - dy);
			});

			$.on(this.$container, 'mouseup', () => {
				scrolling_active = false;
			});

			$.on(this.$container, 'mouseout', () => {
				scrolling_active = false;
			});
		}

		bind_bar_events() {
			if (this.options.readonly) return

			if (!this.options.draggable_bar_handles) {
				this.bind_bar_progress();

				return
			}

			let is_dragging = false;
			let x_on_start = this.resource_width || 0;
			let x_on_scroll_start = 0;
			let is_resizing_left = false;
			let is_resizing_right = false;
			let parent_bar_id = null;
			let bars = []; // instanceof Bar

			this.bar_being_dragged = null;

			function action_in_progress() {
				return is_dragging || is_resizing_left || is_resizing_right
			}

			$.on(this.$svg, 'mousedown', '.bar-wrapper, .handle', (e, element) => {
				const bar_wrapper = $.closest('.bar-wrapper', element);

				if (element.classList.contains('left')) {
					is_resizing_left = true;
				} else if (element.classList.contains('right')) {
					is_resizing_right = true;
				} else if (element.classList.contains('bar-wrapper')) {
					is_dragging = true;
				}

				bar_wrapper.classList.add('active');

				x_on_start = e.clientX;

				parent_bar_id = bar_wrapper.getAttribute(DATA_ATTR.ID);

				const ids = [
					parent_bar_id,
					...this.get_all_dependent_tasks(parent_bar_id),
				];

				bars = ids.map(id => this.get_bar(id));

				this.bar_being_dragged = parent_bar_id;

				bars.forEach(bar => {
					const $bar = bar.$bar;

					$bar.ox = $bar.getX();
					$bar.oy = $bar.getY();
					$bar.owidth = $bar.getWidth();
					$bar.finaldx = 0;
				});
			});

			$.on(this.$svg, 'mousemove', e => {
				if (!action_in_progress()) return

				const dx = e.clientX - x_on_start;

				bars.forEach(bar => {
					const $bar = bar.$bar;

					$bar.finaldx = this.get_snap_position(dx);

					this.hide_popup();

					const { move_dependent } = this.options;

					if (is_resizing_left) {
						if (parent_bar_id === bar.task.id) {
							bar.update_bar_position({
								x: $bar.ox + $bar.finaldx,
								width: $bar.owidth - $bar.finaldx,
							});
						} else if (move_dependent === 'left' || move_dependent === 'both') {
							bar.update_bar_position({
								x: $bar.ox + $bar.finaldx,
							});
						}
					} else if (is_resizing_right) {
						if (parent_bar_id === bar.task.id) {
							bar.update_bar_position({
								width: $bar.owidth + $bar.finaldx,
							});
						} else if (move_dependent === 'right' || move_dependent === 'both') {
							bar.update_bar_position({
								x: $bar.ox + $bar.finaldx,
							});
						}
					} else if (is_dragging && this.options.draggable_bar) {
						bar.update_bar_position({ x: $bar.ox + $bar.finaldx });
					}
				});
			});

			document.addEventListener('mouseup', () => {
				if (is_dragging || is_resizing_left || is_resizing_right) {
					bars.forEach(bar => bar.group.classList.remove('active'));
				}

				is_dragging = false;
				is_resizing_left = false;
				is_resizing_right = false;
			});

			$.on(this.$container, 'scroll', e => {
				this.hide_popup();

				let elements = document.querySelectorAll('.bar-wrapper');
				let localBars = [];
				let dx;

				const ids = [];

				this.layers.date.setAttribute(
					'transform',
					'translate(0,' + e.currentTarget.scrollTop + ')'
				);

				if (x_on_scroll_start) {
					dx = e.currentTarget.scrollLeft - x_on_scroll_start;
				}

				Array.prototype.forEach.call(elements, function (el) {
					ids.push(el.getAttribute(DATA_ATTR.ID));
				});

				if (dx && this.options.horizontal_auto_scroll_labels) {
					localBars = ids.map(id => this.get_bar(id));

					localBars.forEach(bar => {
						bar.update_label_position_on_horizontal_scroll({
							x: dx,
							sx: e.currentTarget.scrollLeft,
						});
					});
				}

				x_on_scroll_start = e.currentTarget.scrollLeft;

				if (this.options.resource_fixed) {
					this.layers.resource_title.setAttribute(
						'transform',
						`translate(${x_on_scroll_start}, ${e.currentTarget.scrollTop})`
					);

					this.layers.resource.setAttribute(
						'transform',
						`translate(${x_on_scroll_start},0)`
					);

					this.layers.resource_bg.setAttribute(
						'transform',
						`translate(${x_on_scroll_start},0)`
					);
				}
			});

			$.on(this.$svg, 'mouseup', () => {
				this.bar_being_dragged = null;

				bars.forEach(bar => {
					const $bar = bar.$bar;

					if (!$bar.finaldx) return

					$bar.finaldx = 0;

					bar.date_changed();
					bar.set_action_completed();
				});
			});

			this.bind_bar_progress();
		}

		resource_expand_all() {
			if (!this.options.resource_collapse_enable) return

			this.hide_popup();

			const is_open = true;

			const groups = [];

			this.resource_tree.forEach((item, i) => {
				if (item.type === DATA_TYPE.GROUP) {
					groups.push({
						start: i + 1,
					});
				} else {
					groups[groups.length - 1].end = i;
				}
			});

			const last_group = groups[groups.length - 1];

			if (last_group && last_group.end === 0) {
				last_group.end = this.resource_tree.length;
			}

			if (last_group.start === last_group.end) {
				groups.pop();
			}

			groups.forEach(group => {
				const first = this.resource_tree[group.start - 1];

				let selector = `[data-group-id="${first.group_id}"]`;

				const arrow = document.querySelector(selector + '.resource-arrow');

				this.set_transform_origin_element(arrow);

				selector += ':not(.resource-pointer)';

				const els = document.querySelectorAll(selector);

				const toggle = els[0].getAttribute(DATA_ATTR.TOGGLE);

				if (!toggle || toggle === DATA_OPEN.OPEN) return

				els[0].setAttribute(DATA_ATTR.TOGGLE, DATA_OPEN.OPEN);

				arrow.classList.remove('-close');

				const elements = this.get_open_hide_elements(group.start, group.end);

				this.resource_tree_open_hide({
					...elements,
					is_open,
				});
				this.reset_index();
				this.remake_arrows();
				this.display_arrows();
				this.vertical_resize_gantt();
			});
		}

		resource_collapse_all() {
			if (!this.options.resource_collapse_enable) return

			this.hide_popup();

			const is_open = false;

			const groups = [];

			this.resource_tree.forEach((item, i) => {
				if (item.type === DATA_TYPE.GROUP) {
					groups.push({
						start: i + 1,
					});
				} else {
					groups[groups.length - 1].end = i;
				}
			});

			const last_group = groups[groups.length - 1];

			if (last_group && last_group.end === 0) {
				last_group.end = this.resource_tree.length;
			}

			if (last_group.start === last_group.end) {
				groups.pop();
			}

			groups.forEach(group => {
				if (!group.end) return

				const first = this.resource_tree[group.start];

				let selector = `[data-group-id="${first.group_id}"]`;

				const arrow = document.querySelector(selector + '.resource-arrow');

				this.set_transform_origin_element(arrow);

				selector += ':not(.resource-pointer)';

				const els = document.querySelectorAll(selector);

				const toggle = els[0].getAttribute(DATA_ATTR.TOGGLE);

				if (toggle === DATA_OPEN.CLOSE) return

				els[0].setAttribute(DATA_ATTR.TOGGLE, DATA_OPEN.CLOSE);

				arrow.classList.add('-close');

				const elements = this.get_open_hide_elements(group.start, group.end);

				this.resource_tree_open_hide({
					...elements,
					is_open,
				});
				this.reset_index();
				this.remake_arrows();
				this.display_arrows();
				this.vertical_resize_gantt();
			});
		}

		bind_resource_events() {
			let is_resizing = false;
			let x_on_start;
			let $resource_resize = null;

			$.on(this.$svg, 'click', '.resource-text.-task', (event, element) => {
				this.hide_popup();

				const id = element.getAttribute(DATA_ATTR.ID);

				const bar = this.get_bar(id);

				const barX = bar.$bar.getX();

				const resource_width = this.resource_header_row.getWidth();

				const left = barX - (resource_width + 50);

				this.$container.scrollTo(left, this.$container.scrollTop);
			});

			$.on(this.$svg, 'keyup', '.new-workitem', event => {
				if (event.keyCode === 13) {
					this.trigger_event('new_task', [
						event.target.value,
						event.target.dataset,
					]);

					setTimeout(() => {
						event.target.value = '';
					}, 200);
				}
			});

			if (this.options.resource_collapse_enable) {
				$.on(
					this.$svg,
					'click',
					[
						'.resource-text.-group',
						'.resource-text.-sub-group',
						'.resource-pointer',
					],
					(e, element) => {
						this.hide_popup();

						const group_id = element.getAttribute(DATA_ATTR.GROUP_ID);
						const sub_group_id = element.getAttribute(DATA_ATTR.SUB_GROUP_ID);

						let selector = group_id ? `[data-group-id="${group_id}"]` : '';
						let start;
						let is_open;

						if (sub_group_id) {
							selector = `[data-sub-group-id="${sub_group_id}"]`;

							start = this.resource_tree.findIndex(
								rt =>
									rt.group_id == group_id &&
									rt.type !== 'task' &&
									rt.sub_group_id == sub_group_id
							);
						} else {
							start = this.resource_tree.findIndex(
								rt => rt.group_id == group_id && rt.type !== 'task'
							);
						}

						const arrow = document.querySelector(selector + '.resource-arrow');

						this.set_transform_origin_element(arrow);

						selector += ':not(.resource-pointer)';

						const els = document.querySelectorAll(selector);

						const toggle = els[0].getAttribute(DATA_ATTR.TOGGLE);

						if (!toggle || toggle === DATA_OPEN.OPEN) {
							els[0].setAttribute(DATA_ATTR.TOGGLE, DATA_OPEN.CLOSE);

							arrow.classList.add('-close');

							is_open = false;
						} else {
							els[0].setAttribute(DATA_ATTR.TOGGLE, DATA_OPEN.OPEN);

							arrow.classList.remove('-close');

							is_open = true;
						}

						start++;

						const end = start + els.length - 2;

						const elements = this.get_open_hide_elements(start, end);

						this.resource_tree_open_hide({
							...elements,
							is_open,
						});
						this.reset_index();
						this.remake_arrows();
						this.display_arrows();
						this.vertical_resize_gantt();
					}
				);
			}

			if (this.options.resource_resize_enable) {
				let dx;
				let posX;

				this.last_resource_pos_x = 0;

				const { resource_min_width } = this.options;

				$.on(this.$svg, 'mousedown', '.resource-resize', e => {
					is_resizing = true;
					x_on_start = e.clientX;

					$resource_resize = this.resource_line;
					$resource_resize.owidth = this.resource_line.getWidth();
					$resource_resize.ox = this.resource_line.getX();
				});

				$.on(this.$svg, 'mousemove', e => {
					if (!is_resizing) return

					dx = e.clientX - x_on_start;

					posX = $resource_resize.ox + dx;

					if (
						!posX ||
						isNaN(posX) ||
						posX <= resource_min_width ||
						posX <= this.column_width ||
						posX <= this.resource_width - 200 ||
						posX >= this.resource_width + 200
					) {
						return
					}

					this.resource_line.setAttribute('x', posX);
					this.resource_header_row.setAttribute('width', posX);
					this.resource_header_line.setAttribute('width', posX);
					this.resource_background.setAttribute('width', posX);
					this.resource_background_r_clip.setAttribute('width', posX);
					this.resource_header_text.setAttribute('width', posX);
					this.resource_grid_layer.forEach(x => {
						x.setAttribute('width', posX);
					});
					this.resource_line_grid_layer.forEach(x => {
						x.setAttribute('width', posX);
					});
				});

				$.on(this.$svg, 'mouseup', () => {
					if (!is_resizing) return

					is_resizing = false;

					this.resource_item_title_list.forEach(x => {
						const { element, padding, name, type } = x;

						if (type === DATA_TYPE.NEW_WORKITEM) return

						element.setAttribute('width', posX);

						this.utilities.text_ellipsis(element, name, posX - padding);
					});

					this.text_dates.forEach(x => {
						x.setAttribute('x', x.getX() + dx);
					});

					this.text_dates_upper.forEach(x => {
						x.setAttribute('x', x.getX() + dx);
					});

					this.set_x_grid_highlights(dx, posX);

					this.update_position_bars(posX);
					this.remake_arrows();
					this.display_arrows();

					this.last_resource_pos_x = posX - this.resource_width;
				});
			}
		}

		set_x_grid_highlights(dx, posX) {
			const line1 = this.today_highlight_line_1;
			const line2 = this.today_highlight_line_2;

			line1.setAttribute('x', line1.getX() + dx);
			line2.setAttribute('x', line2.getX() + dx);

			this.grid_highlights_weekend.forEach(x => {
				x.setAttribute('x', x.getX() + dx);
			});

			this.grid_ticks.forEach(x => {
				x.setAttribute('x', x.getX() + dx);
			});

			this.grid_highlights_past_days.setAttribute('x', posX);
		}

		set_transform_origin_element(element) {
			const { x, y } = element.getBBox();
			const w = element.getWidth() / 2;
			const h = element.getHeight() / 2;

			element.setAttribute('transform-origin', `${x + w}px ${y + h}px`);
		}

		get_open_hide_elements(start, end) {
			let [childRows, childTexts, childLines] = this.layers.resource.children;

			const firstText = [...childTexts.children][start - 1];
			const firstType = firstText.getAttribute(DATA_ATTR.TYPE);

			const rows = [...childRows.children].filter(
				(c, i) => i >= start && i <= end
			);

			const texts = [...childTexts.children].filter(
				(c, i) => i >= start && i <= end
			);

			const lines = [...childLines.children]
				.filter(c => c.nodeName === 'line')
				.filter((c, i) => i >= start && i <= end);

			const nextRows = [...childRows.children].filter((c, i) => i > end);

			const nextTexts = [...childTexts.children].filter((c, i) => i > end);

			const nextLines = [...childLines.children]
				.filter(c => c.nodeName === 'line')
				.filter((c, i) => i > end);

			return {
				rows,
				texts,
				lines,
				nextRows,
				nextTexts,
				nextLines,
				firstType,
			}
		}

		reset_index() {
			const g_texts = this.get_g_texts();

			let index = 0;

			for (let i = 0; i < g_texts.length; i++) {
				const g = g_texts[i];

				if (
					g.getAttribute(DATA_ATTR.TYPE) === DATA_TYPE.WORKITEM &&
					g.getAttribute(DATA_ATTR.ID)
				) {
					const task = this.get_task(g.getAttribute(DATA_ATTR.ID));

					if (task) {
						task._index = index;
					}
				}

				if (
					g.getAttribute(DATA_ATTR.OPEN) === DATA_OPEN.OPEN &&
					g.getAttribute(DATA_ATTR.OPACITY) !== '0'
				) {
					index++;
				}
			}
		}

		display_arrows() {
			this.arrows.forEach(arrow => {
				const display_from = arrow.from_task.bar_group.getAttribute('display');
				const display_to = arrow.to_task.bar_group.getAttribute('display');

				const display =
					display_from === 'none' || display_to === 'none' ? 'none' : 'block';

				arrow.element.setAttribute('display', display);
			});
		}

		open_close_bar(text, is_next, is_open, texts, rows_height) {
			const childrens = Array.from(text.children);

			const element = childrens.find(child => child.getAttribute(DATA_ATTR.ID));

			if (!element) return

			const task_id = element.getAttribute(DATA_ATTR.ID);

			if (!task_id) return

			const bar = this.bars.find(bar => bar.task.id == task_id);

			if (!bar || !bar.bar_group) return

			let y = 0;

			if (is_next) {
				const rows_affected = texts.filter(
					t => t.getAttribute(DATA_ATTR.TYPE) !== DATA_TYPE.GROUP
				).length;

				const height = rows_affected * rows_height;

				y = is_open ? height : height * -1;

				if (bar.bar_group) {
					const bar_groups = [...bar.bar_group.children];

					let el_y = 0;

					bar_groups.forEach(el => {
						el_y = el.getY() + y;

						el.setAttribute('y', el_y);
					});

					if (bar.arrows) {
						bar.arrows.forEach(arrow => {
							arrow.from_task.y = el_y;
						});
					}
				}

				if (bar.handle_group) {
					const handle_groups = [...bar.handle_group.children];

					handle_groups.forEach(el => {
						el.setAttribute('y', el.getY() + y);
					});
				}
			} else {
				const display = is_open ? 'block' : 'none';

				bar.bar_group.setAttribute('display', display);
			}
		}

		vertical_resize_gantt() {
			const g_texts = this.get_g_texts();

			const rows_height = this.get_rows_height();

			const total_rows = g_texts.reduce((value, g) => {
				const is_open =
					g.getAttribute(DATA_ATTR.OPEN) !== DATA_OPEN.CLOSE &&
					g.getAttribute(DATA_ATTR.OPACITY) !== '0';

				return is_open ? value + 1 : value
			}, 0);

			let height = rows_height * total_rows;
			height += this.options.header_height;
			height += this.options.padding / 2;

			this.$svg.setAttribute('height', height);
		}

		resource_tree_open_hide({
			rows,
			texts,
			lines,
			nextRows,
			nextTexts,
			nextLines,
			firstType,
			is_open,
		}) {
			const opacity = is_open ? '1' : '0';
			const open = is_open ? DATA_OPEN.OPEN : DATA_OPEN.CLOSE;

			const rows_height = this.get_rows_height();

			texts = texts.filter(
				text =>
					text.getAttribute(DATA_ATTR.TYPE_PARENT) === firstType ||
					(text.getAttribute(DATA_ATTR.TYPE_PARENT) !== firstType &&
						text.getAttribute(DATA_ATTR.OPEN) === DATA_OPEN.OPEN)
			);

			texts.forEach((text, i) => {
				if (text.getAttribute(DATA_ATTR.TYPE_PARENT) === firstType) {
					text.setAttribute(DATA_ATTR.OPEN, open);
				}

				text.setAttribute('opacity', opacity);

				rows[i].setAttribute('opacity', opacity);

				lines[i].setAttribute('opacity', opacity);

				this.open_close_bar(text, false, is_open);
			});

			if (nextRows.length) {
				const y_size = rows_height * texts.length;

				nextLines.forEach(line => line.setAttribute('opacity', opacity));

				nextRows.forEach(row => {
					if (is_open) {
						row.setAttribute('y', row.getY() + y_size);
					} else {
						row.setAttribute('y', row.getY() - y_size);
					}
				});

				nextTexts.forEach(text => {
					this.open_close_bar(text, true, is_open, texts, rows_height);

					Array.from(text.children).forEach(el => {
						if (is_open) {
							el.setAttribute('y', el.getY() + y_size);
						} else {
							el.setAttribute('y', el.getY() - y_size);
						}

						if (el.getAttribute('transform-origin')) {
							this.set_transform_origin_element(el);
						}
					});
				});
			}
		}

		bind_bar_progress() {
			let x_on_start = this.resource_width || 0;
			let is_resizing = null;
			let bar = null;
			let $bar_progress = null;
			let $bar = null;

			$.on(this.$svg, 'mousedown', '.handle.progress', (e, handle) => {
				is_resizing = true;

				x_on_start = e.clientX;

				const $bar_wrapper = $.closest('.bar-wrapper', handle);
				const id = $bar_wrapper.getAttribute(DATA_ATTR.ID);

				bar = this.get_bar(id);

				$bar_progress = bar.$bar_progress;
				$bar = bar.$bar;

				$bar_progress.finaldx = 0;
				$bar_progress.owidth = $bar_progress.getWidth();
				$bar_progress.min_dx = -$bar_progress.getWidth();
				$bar_progress.max_dx = $bar.getWidth() - $bar_progress.getWidth();
			});

			$.on(this.$svg, 'mousemove', e => {
				if (!is_resizing) return

				let dx = e.clientX - x_on_start;

				if (dx > $bar_progress.max_dx) {
					dx = $bar_progress.max_dx;
				}

				if (dx < $bar_progress.min_dx) {
					dx = $bar_progress.min_dx;
				}

				const $handle = bar.$handle_progress;

				$.attr($bar_progress, 'width', $bar_progress.owidth + dx);
				$.attr($handle, 'points', bar.get_progress_polygon_points());

				$bar_progress.finaldx = dx;
			});

			$.on(this.$svg, 'mouseup', () => {
				is_resizing = false;

				if (!($bar_progress && $bar_progress.finaldx)) return

				$bar_progress.finaldx = 0;

				bar.progress_changed();
				bar.set_action_completed();
			});
		}

		get_g_texts() {
			const [, childTexts] = this.layers.resource.children;

			return [...childTexts.children]
		}

		get_rows_height() {
			const height = this.options.bar_height + this.options.padding;

			return height
		}

		get_all_dependent_tasks(task_id) {
			let out = [];
			let to_process = [task_id];

			while (to_process.length) {
				const deps = to_process.reduce(
					(acc, curr) => acc.concat(this.dependency_map[curr] || []),
					[]
				);

				to_process = deps.filter(d => !out.includes(d));

				out = out.concat(to_process);
			}

			return out.filter(Boolean)
		}

		get_snap_position(dx) {
			let odx = dx,
				rem,
				position;

			if (this.view_is(VIEW_MODE.WEEK)) {
				rem = dx % (this.column_width / 7);
				position =
					odx - rem + (rem < this.column_width / 14 ? 0 : this.column_width / 7);
			} else if (this.view_is(VIEW_MODE.MONTH)) {
				rem = dx % (this.column_width / 30);
				position =
					odx - rem + (rem < this.column_width / 60 ? 0 : this.column_width / 30);
			} else {
				rem = dx % this.column_width;
				position =
					odx - rem + (rem < this.column_width / 2 ? 0 : this.column_width);
			}

			return position
		}

		unselect_all() {
			let bars = this.$svg.querySelectorAll('.bar-wrapper');

			bars = [...bars];

			bars.forEach(el => el.classList.remove('active'));
		}

		view_is(modes) {
			if (typeof modes === 'string') {
				return this.options.view_mode === modes
			}

			if (Array.isArray(modes)) {
				return modes.some(mode => this.options.view_mode === mode)
			}

			return false
		}

		get_task(id) {
			return this.task_map[id]
		}

		get_bar(id) {
			return this.bar_map[id]
		}

		show_popup(options) {
			if (!this.popup) {
				this.popup = new Popup(
					this,
					this.popup_wrapper,
					this.options.custom_popup_html,
					this.$container
				);
			}

			this.popup.show(options);
		}

		show_custom_popup(options) {
			if (!this.popup) {
				this.popup = new CustomPopup(
					this,
					this.popup_wrapper_custom,
					this.$container
				);
			}

			this.popup.show(options);
		}

		hide_popup() {
			this.popup && this.popup.hide();
		}

		trigger_event(event, args) {
			if (this.options['on_' + event]) {
				this.options['on_' + event].apply(null, args);
			}
		}

		get_oldest_starting_date() {
			if (!this.tasks.length) return this.gantt_start

			return this.tasks
				.map(task => task._start)
				.reduce((prev_date, cur_date) =>
					cur_date <= prev_date ? cur_date : prev_date
				)
		}

		clear() {
			this.$svg.innerHTML = '';
		}
	}

	return Gantt;

})();
//# sourceMappingURL=simple-gantt.js.map
