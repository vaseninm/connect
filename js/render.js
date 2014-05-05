var render = (function(){

  var addList = function(key){
    $('<div/>', {'text':key, id:'list'+key}).appendTo('#users');  
    var $list = $('#listCount');
    $list.text(parseInt($list.text())+1);
  }

  var removeList = function(key){
    $(document.getElementById('list'+key)).remove();
    var $list = $('#listCount');
    $list.text(parseInt($list.text())-1);
  }

  var addVideoElement = function (stream, key) {
    var o = {id:key, autoplay:true, controls:true};
    if (key == 'local'){
      o.muted = true;
    } else {
      addList(key); 
    }
    var el = $('<video/>', o).appendTo('body')[0];
    el.src = URL.createObjectURL(stream);

    return el;
  }

  var removeVideoElement = function(key){
    removeList(key);
    $(document.getElementById(key)).remove();
  }

  return {
    init: function(){
     $('#base').show();  
    },
    addVideoElement: addVideoElement,
    removeVideoElement: removeVideoElement
  }
})();
