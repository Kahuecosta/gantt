export default class Popup {
    constructor(parent, custom_html) {
        this.parent = parent;
        this.custom_html = custom_html;
        this.make();
    }

    make() {
        this.parent.innerHTML = `
            <div class="title"></div>
            <div class="type"></div>
            <div class="subtitle"></div>
            <div class="pointer"></div>
        `;

        this.hide();

        this.title = this.parent.querySelector('.title');
        this.type = this.parent.querySelector('.type');
        this.subtitle = this.parent.querySelector('.subtitle');
        this.pointer = this.parent.querySelector('.pointer');
    }

    show(options) {
        if (!options.target_element) {
            throw new Error('target_element is required to show popup');
        }

        if (!options.position) {
            options.position = 'left';
        }

        const target_element = options.target_element;

        if (this.custom_html) {
            let html = this.custom_html(options.task);
            html += '<div class="pointer"></div>';
            this.parent.innerHTML = html;
            this.pointer = this.parent.querySelector('.pointer');
        } else {
            // set data
            this.title.innerHTML = options.title;

            this.set_type(options.type);

            this.subtitle.innerHTML = options.subtitle;
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
            this.parent.style.left =
                position_meta.x + (position_meta.width + 10) + 'px';
            this.parent.style.top = position_meta.y + 'px';

            this.pointer.style.transform = 'rotateZ(90deg)';
            this.pointer.style.left = '-7px';
            this.pointer.style.top = '2px';
        }

        // show
        this.parent.style.opacity = 1;
        this.parent.style.zIndex = 0;
    }

    set_type(type = {}) {
        const { color, name, icon } = type;

        if (name) {
            this.type.style.display = 'inherit';
        } else {
            this.type.style.display = 'none';

            return;
        }

        let typeIcon = '';

        if (icon) {
            typeIcon = `<img class="popup-type-icon" src="${icon}" />`;
        } else if (color) {
            typeIcon = `<span class="popup-type-icon" style="background-color:${color}"></span>`;
        }

        this.type.innerHTML = `<span class="popup-type-name">${typeIcon}${name}</span>`;
    }

    hide() {
        this.parent.style.opacity = 0;
        this.parent.style.left = 0;
        this.parent.style.zIndex = -1;
    }
}
