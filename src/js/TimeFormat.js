export default class TimeFormat {
	static format(sec) {
		var h = Math.floor(sec / 3600);
		var m = Math.floor(sec % 3600 / 60);
		var s = Math.floor(sec % 3600 % 60);

		return (h > 0 ? ('0' + h).slice(-2)+ ":"  : '') + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
	}
}