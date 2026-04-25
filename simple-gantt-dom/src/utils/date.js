const YEAR = 'year';
const MONTH = 'month';
const DAY = 'day';
const HOUR = 'hour';
const QUARTER_DAY = 'quarter_day';
const HALF_DAY = 'half_day';
const WEEK = 'week';

export default {
    parse(date, date_separator = '-', time_separator = /[.:]/) {
        if (date instanceof Date) {
            return date;
        }
        if (typeof date === 'string') {
            let date_parts, time_parts;
            const parts = date.split(' ');

            date_parts = parts[0]
                .split(date_separator)
                .map((val) => parseInt(val, 10));
            time_parts = parts[1] && parts[1].split(time_separator);

            // month is 0-indexed
            date_parts[1] = date_parts[1] - 1;

            let vals = date_parts;

            if (time_parts && time_parts.length) {
                if (time_parts.length === 4) {
                    time_parts[3] = '0.' + time_parts[3];
                    time_parts[3] = parseFloat(time_parts[3]) * 1000;
                }
                vals = vals.concat(time_parts.map((val) => parseInt(val, 10)));
            }

            return new Date(...vals);
        }
    },

    to_string(date, with_time = false) {
        if (!(date instanceof Date)) {
            throw new TypeError('Invalid argument type');
        }
        const vals = this.get_date_values(date).map((val, i) => {
            if (i === 1) {
                // month is 0-indexed
                val = val + 1;
            }
            return padStart(val + '', 2, '0');
        });
        const date_string = `${vals[0]}-${vals[1]}-${vals[2]}`;
        const time_string = `${vals[3]}:${vals[4]}:${vals[5]}`;

        return date_string + (with_time ? ' ' + time_string : '');
    },

    format(date, format_string = 'YYYY-MM-DD HH:mm:ss.SSS', lang = 'en') {
        const values = this.get_date_values(date);
        const format_map = {
            YYYY: values[0],
            MM: padStart(values[1] + 1, 2, '0'),
            DD: padStart(values[2], 2, '0'),
            HH: padStart(values[3], 2, '0'),
            mm: padStart(values[4], 2, '0'),
            ss: padStart(values[5], 2, '0'),
            SSS: padStart(values[6], 3, '0'),
            D: values[2],
            MMMM: get_month_name(values[1], lang),
            MMM: get_month_name(values[1], lang, true),
        };

        return format_string.replace(/YYYY|MMMM|MMM|MM|DD|HH|mm|ss|SSS|D/g, (match) => {
            return format_map[match];
        });
    },

    diff(date_a, date_b, scale = DAY) {
        let milliseconds, seconds, minutes, hours, days, months, years;

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
        );
    },

    today() {
        const vals = this.get_date_values(new Date());
        return new Date(vals[0], vals[1], vals[2]);
    },

    now() {
        return new Date();
    },

    add(date, qty, scale) {
        qty = parseInt(qty, 10);
        const vals = [
            date.getFullYear() + (scale === YEAR ? qty : 0),
            date.getMonth() + (scale === MONTH ? qty : 0),
            date.getDate() + (scale === DAY ? qty : 0),
            date.getHours() + (scale === HOUR ? qty : 0),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds(),
        ];
        return new Date(...vals);
    },

    start_of(date, scale) {
        const scores = {
            [YEAR]: 6,
            [MONTH]: 5,
            [DAY]: 4,
            [HOUR]: 3,
            quarter_day: 2,
            half_day: 1,
        };

        function should_reset(_scale) {
            const current_score = scores[scale];
            return scores[_scale] <= current_score;
        }

        const vals = [
            date.getFullYear(),
            should_reset(YEAR) ? 0 : date.getMonth(),
            should_reset(MONTH) ? 1 : date.getDate(),
            should_reset(DAY) ? 0 : date.getHours(),
            should_reset(HOUR) ? 0 : date.getMinutes(),
            should_reset(quarter_day) ? 0 : date.getSeconds(),
            should_reset(half_day) ? 0 : date.getMilliseconds(),
        ];

        return new Date(...vals);
    },

    clone(date) {
        return new Date(...this.get_date_values(date));
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
        ];
    },

    get_days_in_month(date) {
        const no_of_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        const month = date.getMonth();

        if (month !== 1) {
            return no_of_days[month];
        }

        // Feb
        const year = date.getFullYear();
        if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
            return 29;
        }
        return 28;
    },
};

function padStart(str, targetLength, padString) {
    str = str + '';
    while (str.length < targetLength) {
        str = padString + str;
    }
    return str;
}

function get_month_name(month, lang, abbr = false) {
    const month_names = {
        en: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ],
        pt: [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro',
        ],
    };
    const name = month_names[lang][month];
    return abbr ? name.substring(0, 3) : name;
}
