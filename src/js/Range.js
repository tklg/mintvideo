import Log from 'Log.js';
import _ from 'NotUnderscore.js';

export default function Range(start, elems, callbacks) {
	const TAG = 'Range';
	const DEFAULTWIDTH = 80;
	var seeking = false;

	var fromLeft = 0;
	var {
		container,
		actual,
		loaded,
		handle,
	} = elems;
	var {
		onDrag,
		onDrop,
	} = callbacks;
	// hack
	var maxWidth, rangeStartsAt;

	// reimplement without drag events
	// https://stackoverflow.com/a/9334106/3605190

	function startDrag(e) {
		e.dataTransfer.setData('text/plain', 'nonnull');
		e.dataTransfer.setDragImage(document.createElement('span'), 0, 0);
		//e.dataTransfer.dropEffect = 'move';
		handle.classList.add('dragging');
		seeking = true;
	}
	function handleDrag(e) {
		var fromLeft = e.pageX - rangeStartsAt;
		if (fromLeft > maxWidth || fromLeft < 0) return;
		handle.style.left = fromLeft + "px";
		actual.style.width = fromLeft + "px";

		if (onDrag && typeof onDrag === 'function') onDrag(fromLeft / maxWidth);
	}
	function endDrag(e) {
		var fromLeft = e.pageX - rangeStartsAt;
		if (fromLeft > maxWidth || fromLeft < 0) return;
		handle.style.left = fromLeft + "px";
		actual.style.width = fromLeft + "px";
		handle.classList.remove('dragging');
		seeking = false;
		if (onDrop && typeof onDrop === 'function') onDrop(fromLeft / maxWidth);
	}

	function handleClick(e) {
		var fromLeft = e.pageX - rangeStartsAt;
		if (fromLeft > maxWidth || fromLeft < 0) return;
		handle.style.left = fromLeft + "px";
		actual.style.width = fromLeft + "px";
		seeking = false;
		if (onDrop && typeof onDrop === 'function') onDrop(fromLeft / maxWidth);
	}

	this.setLoaded = function(pct) {
		loaded.style.width = maxWidth * pct + 'px';
	}
	this.setProgress = function(pct) {
		handle.style.left = maxWidth * pct + "px";
		actual.style.width = maxWidth * pct + "px";
		// if (onDrop && typeof onDrop === 'function') onDrop(pct);
	}
	this.seeking = function() {
		return seeking;
	}
	this.recalc = function() {
		var pct = parseInt(handle.style.left) / maxWidth;
		maxWidth = container.offsetWidth > 10 ? container.offsetWidth : DEFAULTWIDTH;
		rangeStartsAt = container.getBoundingClientRect().left;
		this.setProgress(pct);
	}

	this.recalc();

	_.event(container, 'dragstart', startDrag);
	_.event(container, 'drag', handleDrag);
	_.event(container, 'dragend', endDrag);

	_.event(container, 'mousedown', handleClick);

	handle.style.left = maxWidth * start + 'px';
	actual.style.width = maxWidth * start + 'px';
}
