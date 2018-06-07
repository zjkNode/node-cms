/*
 * nunjucks filters
 * author zjk
 * date 2017-12-06
*/

let path = require('path'),
	cleanCss = require('clean-css'),
	uglifyJs = require('uglify-js'),
	fs = require('fs');

var styleFilter = function(styleObj) {
	var styleArr = [];
	var exceptArr = ['font-size','border','border-radius'];
	for(var key in styleObj){
		let value = styleObj[key];
		if(!value){
			continue;
		}
		var str = value;
		if( exceptArr.indexOf(key) == -1){
			let reg = /\d+(px)/g;
			str = value.replace(reg,function(px){
				var fix2 = (parseInt(px)/108*1).toFixed(2);
				return fix2 +'rem';
			});
		}
		if(key === 'background-image'){
			styleArr.push(`${key}:url(${str})`);
		} else {
			styleArr.push(`${key}:${str}`);// key + ':"'+ styleObj[key] +'"'
		}
	}
	return styleArr.join(';') + (styleArr.length > 0 ? ';' : '');
}

var cssFilter = function(compObjs){
	let cssPaths = [];
	for (var i = 0; i < compObjs.length; i++) {
		let item = compObjs[i].name;
		let itemPath = `src/activity/components/${item}/${item}.css`;

		if(cssPaths.indexOf(itemPath) > -1){ // 已经存在 跳过
    		continue;
		}

		if(!fs.existsSync(path.join(__dirname, itemPath))){
			console.log('not exist: '+ itemPath);
			continue;
		}

		cssPaths.push(itemPath);
	}
	var rebaseTo = path.join(__dirname, 'src/static/min.css');
	new cleanCss().minify(cssPaths, function(err, output){
		if(err){
			console.log(err);
			return;
		} 
		fs.writeFileSync(rebaseTo, output.styles, 'utf8');
	});
	
	return  '/static/min.css';
}

var jsFilter = function(compObjs){
	let jsPaths = [];
	for (var i = 0; i < compObjs.length; i++) {
		let item = compObjs[i].name;
		let itemPath = `src/activity/components/${item}/${item}.js`;

		if(jsPaths.indexOf(itemPath) > -1){ // 已经存在 跳过
    		continue;
		}

		if(!fs.existsSync(path.join(__dirname, itemPath))){
			console.log('not exist: '+ itemPath);
			continue;
		}

		jsPaths.push(itemPath);
	}
	let jsMin = uglifyJs.minify(jsPaths);
	let rebaseTo = path.join(__dirname, 'src/static/min.js');
	fs.writeFileSync(rebaseTo, jsMin.code, 'utf8');
	
	return  '/static/min.js';
}


var comFilter = function(compObjs){
	let comData = {};
	for (let i = 0; i < compObjs.length; i++) {
		let comKey = compObjs[i].name +'_'+ i;
		comData[comKey] = convertObj(compObjs[i]);
	}
	return JSON.stringify(comData);
}

function convertObj(obj){
	if(typeof(obj) == 'string'){
		return obj;
	}

	let expectProps = ['style','imageUrl','uuid','wrap','name'];
	let resObj = {};
	for(let key in obj){
		if(expectProps.indexOf(key) > -1){
			continue;
		}

		let objValue = obj[key];
		if(key == 'usages'){
			resObj[key] = convertUsages(objValue);
			continue;
		}
		if(key == 'responses' && objValue.length > 0){
			resObj[key] = convertResponse(objValue);
			continue;
		}

		if(Object.prototype.toString.call(objValue) == "[object Object]"){
			resObj[key] = convertObj(objValue);
			continue;
		} 

		if(Object.prototype.toString.call(objValue) == "[object Array]"){
			// buttons.items[index] ====> buttons[index]={}
			// for (var i = 0; i < objValue.length; i++) {
			// 	resObj[i] = convertObj(objValue[i]);
			// }
			
			let items = [];
			for (var i = 0; i < objValue.length; i++) {
				items.push(convertObj(objValue[i]));
			}
			resObj[key] = items;
			continue;
		} 
		resObj[key] = obj[key];
	}

	return resObj;
}

function convertUsages(usages){
	if(usages[0] == 'goApp'){
		let appConfig = {
			goAppIndex:{ href:'native://home', label:'app首页', value:'index' },
			goAppAccount:{ href:'native://account', label:'app帐户页', value:'account' },
			goAppCoupons:{ href:'native://mine_coupons', label:'app优惠券页', value:'coupons' },
			goAppCredit:{ href:'native://credit_home', label:'app认证中心页', value:'credit' },
			goAppCard:{ href:'native://membership_card', label:'app会员卡页', value:'card' }
		};
		return {
			to:usages[0],
			option: appConfig[usages[usages.length-1]]
		};
	}

	if(usages[0] == 'goAlerts'){
		return {
			to: usages[0],
			option:{
				value: usages[usages.length-1]
			}
		}
	}

	return {
		to: usages[0]
	};
}

function convertResponse(responses){
	var res = {};
	for (var i = 0; i < responses.length; i++) {
		var item = responses[i];
		res[item.code] = item;
		res[item.code].usages = convertUsages(item.usages);
	}
	return res;
}



exports.styleFilter = styleFilter;
exports.cssFilter = cssFilter;
exports.jsFilter = jsFilter;
exports.comFilter = comFilter;