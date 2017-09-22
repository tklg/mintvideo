export default class Log {
	static d(tag, str) {
		if (str === undefined) {
			str = tag;
			tag = 'NoTag';
		}
		if (typeof str === 'string' || typeof str === 'number') {
			console.log(`[${tag}]: ${str}`);
		} else {
			console.log(`[${tag}]:`);
			console.log(str);
		}
	}
	static i(tag, str) {
		if (str === undefined) {
			str = tag;
			tag = 'NoTag';
		}
		if (typeof str === 'string' || typeof str === 'number') {
			console.info(`[${tag}]: ${str}`);
		} else {
			console.info(`[${tag}]:`);
			console.log(str);
		}
	}
	static w(tag, str) {
		if (str === undefined) {
			str = tag;
			tag = 'NoTag';
		}
		if (typeof str === 'string' || typeof str === 'number') {
			console.warn(`[${tag}]: ${str}`);
		} else {
			console.warn(`[${tag}]:`);
			console.log(str);
		}
	}
	static e(tag, str) {
		if (str === undefined) {
			str = tag;
			tag = 'NoTag';
		}
		if (typeof str === 'string' || typeof str === 'number') {
			console.error(`[${tag}]: ${str}`);
		} else {
			console.error(`[${tag}]:`);
			console.log(str);
		}
	}
}