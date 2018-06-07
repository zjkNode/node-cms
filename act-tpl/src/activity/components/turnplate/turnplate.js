(function(){
	var clickEvent = ((document.ontouchstart !== null) ?'click' : 'touchstart');
	init();
	function init(){
		initPrize();
	}
	$('.start').on(clickEvent, function(e){
		e.stopPropagation();
		rotateFunc({ id: 2 });
	});

	
	function initPrize(){
		var $container = $('.trunWrap');
		var $prizes = $container.find('.prize');
        var total = $prizes.length;
		var step = 360 / total;
		var skewY = 90 - step;
		for (var i = 0; i < total; i++) {
			var rotate = step/2 + i*step;
			var $prize = $($prizes[i]);
			$prize.css({
				transform:"rotate("+ rotate + "deg) skewY("+ skewY + "deg)",
		    	'-webkit-transform':"rotate("+ rotate + "deg) skewY("+ skewY + "deg)",
		    	'-moz-transform':"rotate("+ rotate + "deg) skewY("+ skewY + "deg)"
			});
			$prize.data('rotate', 360-i*step);
		}
	}

	function rotateFunc(awards){
		$(".turnplate").stopRotate();
		var angle = 0;
		var $prizes = $('.trunWrap .prize');
		for (var i = 0; i < $prizes.length; i++) {
			var $prize = $($prizes[i]);
			if($prize.data('id') == awards.id){
				angle = $prize.data('rotate');
				break;
			}
		}
        $(".turnplate").rotate({
            angle: 0,
            animateTo: (angle+4*360),
            duration: 5*1000,
            callback: function() {
               
            }
        });
	}
})();