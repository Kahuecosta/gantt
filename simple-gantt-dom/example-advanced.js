/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import GanttDOM from './src/index.js';

const responsables = [
	{ id: 1, name: 'Alice Johnson', photo: './images/responsable-1.jpg' },
	{ id: 2, name: 'Bob Smith', photo: './images/responsable-default.png' },
    { id: 3, name: 'Charlie Brown', photo: './images/responsable-default.png' },
]

const groups = [
	{ name: 'Design & UX', id: 1, color: '#e27d02' },
	{ name: 'Development', id: 2 },
	{ name: 'Quality Assurance', id: 3, color: '#d81e46' },
]

const types = [
	{ id: 1, name: 'Feature', bar_class: 'bar-task', color: '#0758b3' },
	{ id: 2, name: 'Bug', bar_class: 'bar-hotfix', color: '#e27d02' },
	{ id: 3, name: 'Milestone', bar_class: 'bar-milestone' },
]

const workitems = [
	{ id: '1', name: 'Market Research', start: '2023-11-01', end: '2023-11-05', progress: 100, responsable_id: 1, group_id: 1, type_id: 1 },
	{ id: '2', name: 'UI Mockups', start: '2023-11-06', end: '2023-11-10', progress: 50, dependencies: ['1'], responsable_id: 1, group_id: 1, type_id: 1 },
	{ id: '3', name: 'Design Review Milestone', start: '2023-11-10', end: '2023-11-10', progress: 0, dependencies: ['2'], responsable_id: 1, group_id: 1, type_id: 3 },
	{ id: '4', name: 'Frontend Development', start: '2023-11-11', end: '2023-11-20', progress: 10, dependencies: ['3'], responsable_id: 2, group_id: 2, type_id: 1 },
	{ id: '5', name: 'Backend API', start: '2023-11-11', end: '2023-11-18', progress: 30, dependencies: ['3'], responsable_id: 3, group_id: 2, type_id: 1 },
	{ id: '6', name: 'Integration Testing', start: '2023-11-21', end: '2023-11-25', progress: 0, dependencies: ['4', '5'], responsable_id: 2, group_id: 3, type_id: 1 },
	{ id: '7', name: 'Production Ready', start: '2023-11-25', end: '2023-11-25', progress: 0, dependencies: ['6'], responsable_id: 3, group_id: 3, type_id: 3 },
    { id: '8', name: 'Documentation', start: '2023-11-06', end: '2023-11-08', progress: 0, dependencies: ['1'], responsable_id: 3, group_id: 2, type_id: 1 },
]

const options = {
	view_mode: 'Day',
	language: 'en',
	highlight_critical_path: true,
	resource_enable: true,
	resource_width: 250,
	resource_title: 'Development',
	workitems_custom_tooltip: true,
	groups_enable: true,
}

let gantt

const init = () => {
    // Custom tooltips
    const tooltipWrapper = document.createElement('div');
    tooltipWrapper.className = 'popup-wrapper-custom';
    tooltipWrapper.style.display = 'none';
    document.body.appendChild(tooltipWrapper);

    workitems.forEach(wi => {
        const tooltip = document.createElement('div');
        tooltip.setAttribute('data-gantt-tooltip-id', wi.id);
        tooltip.innerHTML = `
            <div style="padding: 10px;">
                <strong style="color: #0758b3">${wi.name}</strong><br>
                Assignee ID: ${wi.responsable_id}<br>
                Progress: ${wi.progress}%
            </div>
        `;
        tooltipWrapper.appendChild(tooltip);
    });

	gantt = new GanttDOM(
		'#gantt-target',
		workitems,
		types,
		responsables,
		groups,
		options
	)
}

init();

window.change_view_mode = (mode) => {
    gantt.change_view_mode(mode);
};
