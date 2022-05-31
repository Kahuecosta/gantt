export default class GanttUtilities {
	constructor() {}

	text_ellipsis(el, text, width) {
		if (typeof el.getSubStringLength !== 'undefined') {
			el.innerHTML = text
			let len = text.length

			while (el.getSubStringLength(0, len--) > width) {
				el.innerHTML = text.slice(0, len) + '...'
			}
		} else if (typeof el.getComputedTextLength !== 'undefined') {
			while (el.getComputedTextLength() > width) {
				text = text.slice(0, -1)
				el.innerHTML = text + '...'
			}
		} else {
			// the last fallback
			while (el.getBBox().width > width) {
				text = text.slice(0, -1)
				// we need to update the textContent to update the boundary width
				el.innerHTML = text + '...'
			}
		}
	}

	html_avatar(photo, w, y) {
		const avatar = `<img class="avatar" src="${photo}" width="${w}px" height="${y}px" />`

		return avatar
	}

	generate_id(task) {
		return task.name + '_' + Math.random().toString(36).slice(2, 12)
	}
}
