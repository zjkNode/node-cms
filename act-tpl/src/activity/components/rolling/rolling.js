(function() {
	var annObjs = document.getElementsByClassName("rcontent");
	var rowCount = 3;
	init();
	function init(){
		for (var i = 0; i < annObjs.length; i++) {
			var $annObj = $(annObjs[i]);
			var orient = $annObj.data('orient');
			var lh = $annObj.css('line-height');
			$annObj.css('height', parseInt(lh)*rowCount+'px');// 修正内容高度，防止出现文字截断情况
			orient == 'orientH' ? scrollH($annObj[0]) : scrollV($annObj[0]);
		}
	}
	function scrollH(annObj){
		var scrollWidth = annObj.scrollWidth - annObj.offsetWidth;
		setInterval(function () {
	        annObj.scrollLeft++;
		        if (annObj.scrollLeft >= scrollWidth) annObj.scrollLeft = 0;
		},30);
	}

	var anndelay = 2000;
	var anncount = 0;
	var annheight = 24;
	var annst = 0;
	function scrollV(annObj){
		annheight = annObj.clientHeight;
	    if(!annst){
	      annObj.innerHTML += annObj.innerHTML;
	      annObj.scrollTop = 0;
	      if(annObj.scrollHeight > annheight * rowCount){
	         annst = setTimeout(function(){ scrollV(annObj); }, anndelay);
	      }
	      return;
	    }
	    if(anncount == annheight){
	      if(annObj.scrollHeight - annheight <= annObj.scrollTop){
	         annObj.scrollTop = annObj.scrollHeight - annheight;
	      } 
	      anncount = 0;
	      annst = setTimeout(function(){ scrollV(annObj); }, anndelay);
	    } else {
	      annObj.scrollTop++ ;
	      anncount ++ ;
	      annst = setTimeout(function(){ scrollV(annObj); }, 10);
	    }
	}

})();