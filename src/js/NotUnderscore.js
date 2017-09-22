export default class _ {
	static createElem(type) {
		return document.createElement(type);
	}
	static createButton(id) {
		var btn = _.createElem('button');
		btn.classList.add('mv-btn');
		if (id) btn.id = id;
		return btn;
	}
	static find(str) {
		var res = document.querySelectorAll(str);
		if (res.length === 1) return res[0];
		else return res;
	}
	static first(arr) {
		if (arr && arr.length)
			return arr[0];
		else return arr;
	}
	static event(el, ev, fn) {
		el.addEventListener(ev, fn);
	}
	static unevent(el, ev, fn) {
		el.removeEventListener(ev, fn);
	}
}