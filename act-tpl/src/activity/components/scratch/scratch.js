(function() {
    var clickEvent = ((document.ontouchstart !== null) ?'click' : 'touchstart');
    var utility = Global.utility;
    var Toast = Global.utility.toast;
    var channelCode = $.trim(utility.getQueryParams('channelCode'));
    Global.channelCode = channelCode;

    var prize, flagMask = {};
	init();
	function init() {
		loadPrize();
		$('.scratchWrap .btn').on(clickEvent, function(e){
            e.stopPropagation();
            var btnKey = $(this).data('key');
            _hmt.push(['_trackEvent', Global.code +'_'+ btnKey, 'click', Global.code +'_点击按钮']);
            var handle = new Global.Handle($(this));
            if(handle){
                handle();
                return;
            }
        });
	}
	
	function refreshFloatText(cnt){
		if(Global.floats){
			for(var key in Global.floats){
				var floatCom = Global.floats[key];
				floatCom.update(key, cnt);
			}
		}
	}

	function loadPrize(){
		var url = '/v1/apis/activityx/act3/scratchCoupon';
        utility.post(url, null, function(res){
        	if(res.code == 1002 || res.code == 1030){
        		noLogin();
        		return;
        	}
        	if(res.code != 200){
        		Toast(res.message);
        		return;
        	}
        	var resData = res.data;
			prize = resData.prize;        	
        	bindPrize(resData.prize);

        	var visiblePrize = $(".scratchWrap .sprize:visible");
        	if(visiblePrize.length == 0){
        		alert(prize);
        		return;
        	}
        	if(resData.type == 2 ){ // 1未登录，已判断 2未认证  3抽奖次数用尽 4当天抽奖次数用尽
        		$('img.smask').css('visibility', 'hidden');
        		return;
        	}
        	if(resData.type == 3 || resData.type == 4){
        		refreshFloatText(0);
        		$('img.smask').css('visibility', 'hidden');
        		return;
        	}
			initEraser();
            
        }, function(error){
            console.log(error);
        });
	}

	function noLogin(){
		// 未登录
        $('img.smask').on(clickEvent, function(e){
        	Toast('用户未登录，请先登录');
            _hmt.push(['_trackEvent', Global.code +'_toLogin', 'click', Global.code +'_去登录']);
        	window.location.href = 'native://login?goBackAfterLogin=true';
        });
	}

	function initEraser(){
		$('.smask').eraser({
			size:20,
			completeRatio:.5,
			completeFunction:function(){
				$($(this)[0].canvas[0]).css('visibility', 'hidden');
				refreshFloatText(0);
				activePrize();
			}
		});
	}

	function bindPrize(pid){
		var $containers = $(".scratchWrap");
		// 支持同一页面多个刮奖区域  支持的不够彻底，刮奖结束没有支持到多区域
		for (var i = 0; i < $containers.length; i++) {
			var $curContainer = $($containers[i]);
			var dataKey = $curContainer.data("key");
			var prizes = Global.actData[dataKey].prizes;
			var	$prizes = $containers.find('.sprize');
			var marginTop = $curContainer.find('.smask').height();
			for (var i = 0; i < prizes.length; i++) {
				var prize = prizes[i], $prize = $prizes.eq(i);
				if(prize.id == pid){
					$prize.css({
						'margin-top': -marginTop +'px',
						'background-image':'url('+ prize.img +')'
					});
					$prize.show();
				} else {
					$prize.remove();
				}
			}
		}
	}

	function activePrize(){
        _hmt.push(['_trackEvent', Global.code +'_active_prize', 'click', Global.code +'_领取奖品']);
		var url = "/v1/apis/activityx/act3/saveACT3";
		utility.post(url, { prize: prize }, function(res){
			if(res.code == 1002 || res.code == 1030){
				Toast(res.message);
				return;
			}
			if(res.code != 200){
				Toast(res.message);
				return;
			}
		}, function(err){
			console.log(err);
		});
	}
})();