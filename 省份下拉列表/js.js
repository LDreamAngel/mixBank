function init(obj_1,obj_2,obj_3){
   	var ar = ["请选择省份","请选择城市","请选择区县"];
	var _obj_1 = document.getElementById(obj_1);
	var _obj_2 = document.getElementById(obj_2);
    var _obj_3 = document.getElementById(obj_3);
	_obj_1.options.add(new Option(ar[0],0));
	_obj_2.options.add(new Option(ar[1],0));
	_obj_3.options.add(new Option(ar[2],0));
	for (i=0;i<mp.length;i++){//循环添加
			_obj_1.options.add(new Option(mp[i],i+1));
		}
	var pindex;
	function chang_one(){
		
		pindex=_obj_1.selectedIndex;
        _obj_2.options.length=0;
        _obj_2.options.add(new Option(ar[1],0));
			if (pindex!=0){
				for (k=0;k<mc[pindex-1].length;k++){
				_obj_2.options.add(new Option(mc[pindex-1][k],k+1));
				}
			}
		 _obj_3.options.length =0;
		 _obj_3.options.add(new Option(ar[2],0));
	}
	_obj_1.onchange =chang_one;
	
	var cindex;
	function chang_two(){
		cindex = _obj_2.selectedIndex;
		_obj_3.options.length=0;
		_obj_3.options.add(new Option(ar[2],0));
		if (cindex!=0){//循环添加
			for (j=0;j<mh[pindex-1][cindex-1].length;j++){
				_obj_3.options.add(new Option(mh[pindex-1][cindex-1][j],j+1));
			}
		}
	}
	_obj_2.onchange =chang_two;
}

