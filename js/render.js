var render = (function(){
  var updateList = function(list){

    var $userCount = $('#usersCount');
    $userCount.empty();
    if (list.length){
      $userCount.html('<h2>Собеседников <span style="color:red">'+list.length+'</span></h2>');
    }

    $('#users').empty();
    for (var i in list) {
     $('<div/>', {text: list[i]}).appendTo('#users');
    }
  }

  var addVideoElement = function (stream, key) {
    var o = {id:key, autoplay:true, controls:true};
    if (key == 'local'){
      o.muted = true;
    }
    var el = $('<video/>', o).appendTo('body')[0];
    el.src = URL.createObjectURL(stream);

    return el;
  }

  return {
    addVideoElement: addVideoElement,
    updateList: updateList
  }
})();
