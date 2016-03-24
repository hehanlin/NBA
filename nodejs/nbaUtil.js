'use strict';

var http = require('http'),
	cheerio = require('cheerio');


var nbaUtil = function(){};
nbaUtil.prototype.index = function(_GET,res) {
	var Cdate = '';
	if(_GET.hasOwnProperty('date')) {
		Cdate = _GET['date'];
	}else {
		var dateTmp = new Date();
		Cdate = dateTmp.getFullYear() + '-' + (dateTmp.getMonth()+1) + '-' + dateTmp.getDate();
		dateTmp = null;
	}
	this.res = res;
	this.getDOM(Cdate);
};

nbaUtil.prototype.getDOM = function(date) {
	var href = 'http://g.hupu.com/nba/' + date;
	var that = this;
	http.get(href,function(response) {
		var data = '';
		response.on('data',function(chunk) {
			data += chunk;
		});
		response.on('end',function() {
			this.parseDOM(data);
		}.bind(that));
	});
};

nbaUtil.prototype.parseDOM = function(html) {
	var $ = cheerio.load(html);
	var data = $('.team_vs').map(function(index,elem) {
		var item = {
			'host_team': {
				'grade': $(elem).find('.team_vs_a_1 .num').text().trim(),
				'Ename': (function() {
					var tmp = $(elem).find('.team_vs_a_1').find('.txt').find('a').attr('href');
					tmp = tmp.split('/');
					return tmp[tmp.length-1];
				}()),
				'Cname': $(elem).find('.team_vs_a_1 .txt a').text().trim()
			},
			'visiting_team': {
				'grade': $(elem).find('.team_vs_a_2 .num').text().trim(),
				'Ename': (function() {
					var tmp = $(elem).find('.team_vs_a_2').find('.txt').find('a').attr('href');
					tmp = tmp.split('/');
					return tmp[tmp.length-1];
				}()),
				'Cname': $(elem).find('.team_vs_a_2 .txt a').text().trim()
			},
			'result': (function(){
				var $_winGrade = $(elem).find('span[class="num red"]');
				return $_winGrade.parents('.clearfix').hasClass('team_vs_a_1')	?
					'host_team'	: 	'visiting_team';
			})(),
			'time': (function(){
				var $_time = $(elem).find('.team_vs_b').find('.b').find('p');
				if($_time.text().trim() == '') {
					return '已结束';
				}else {
					return $_time.text().trim();
				}
			})()
		};
		return item;
	});
	var Cdata = [];
	for (var i = 0,length = data.length; i<length; i++) {
		Cdata.push(data[i]);
	};
	this.responseJSON(Cdata);
}

nbaUtil.prototype.responseJSON = function(data) {
	this.res.writeHeader(200,{'Content-Type': 'text/plain'});
	this.res.write(JSON.stringify(data));
	this.res.end();
};

module.exports = nbaUtil;