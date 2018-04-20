/*
 * Kiosk v5.14.0
 * Copyright (C) 2017 M. P. Cook Limited Liability Co.  <support@cook.company>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

$(function(){
  var address = location.hostname+(location.port ? ':'+location.port: '');
  var data;

  $(".button-collapse").sideNav();

  $('.multiple-url-mode').hide().removeClass('disabled').slideDown();
  $('.multiple-url-mode').removeClass('disabled').show();


  $("#logout").click(function(){
    $('body').hide();
    window.location = 'http://log:out@'+address;
  });

  $.getJSON("http://"+address+'/data',function(d){
    data = d;
    $('#url').val(data.url).siblings('label, i').addClass('active');
    $('#username').val(data.username).siblings('label, i').addClass('active');
    $('#rotate-rate').val(data.rotaterate);
    $('#useragent').val(data.useragent);
    $('#authorization').val(data.authorization);
    if(data.useragent) $('#useragent').val(data.useragent).siblings('label').addClass('active');
    if(data.authorization) $('#authorization').val(data.authorization).siblings('label').addClass('active');

    if(data.headers){
      data.headers.forEach(function(header){
        addHeader(header);
      });  
    }

    // remote scheduler
    if(data.remoteschedule){
      $("#remote-schedule").prop("checked",true);
      $('.remote-schedule-detail').removeClass('disabled');
    }
    if(data.remotescheduleurl)
      $("#remote-schedule-url").val(data.remotescheduleurl).siblings('label').addClass('active');
    if(data.schedulepollinterval){
     $('#schedule-poll-interval').val(data.schedulepollinterval);
    }
    $("#remote").on('change',function(){
      if($("#remote").is(':checked')){
        $('.remote').hide().removeClass('disabled').slideDown();
      }else{
        $('.remote').slideUp();
      }
    });
    $("#remote-schedule").on('change',function(){
      if($("#remote-schedule").is(':checked')){
        $('.remote-schedule-detail').hide().removeClass('disabled').slideDown();
      }else{
        $('.remote-schedule-detail').slideUp();
      }
    });


    $('body').removeClass('loading');
 
  });

  $('.tooltip').tooltip();

  $('#restart').click(function(e){
    e.preventDefault();
    $('body').addClass('loading');
    $('#loading h4').text('Restarting...');
    $.ajax({
      url: "http://"+address+'/data',
      type: 'PUT',
      //data: {'restart': true},
      data: JSON.stringify({'restart': true}),
      success: reload
    })
  });

  $('#add_header').on('click', function(header) {
    addHeader({name: '', value: ''});
  });

  $('#save').click(function(e){
    e.preventDefault();
    var error = [];
    var url = $('#url').val();
    var username = $("#username").val();
    var password = $("#password").val();
    var rotaterate = $("#rotate-rate").val(); 
    var passwordConfirm = $("#confirm_password").val();
    var useragent = $("#useragent").val(); 
    var authorization = $("#authorization").val();
    var remote = $("#remote").is(':checked');
    var remotescheduleurl = $("#remote-schedule-url").val();
    var schedulepollinterval = $("#schedule-poll-interval").val();
    if(url && (url.indexOf("http://") >= 0 || url.indexOf("https://") >= 0 )){
      //url is valid
    }else{
      error.push("URL must be valid.");
    }
    if(!username){
      error.push("Username is required");
    }
    if(password && password != passwordConfirm){
      error.push("Passwords must match.");
    }

    if(error.length){
      for(var i = 0; i < error.length; i++){
        toast(error[i], 4000);
      }
      return false;
    }else{
      //ready to reload
      $('body').addClass('loading');
      $('#loading h4').text('Saving...');
      var newData = {};
      if(username != data.username) newData['username'] = username;
      if(password && password != data.password) newData['password'] = password;
      if(url != data.url) newData['url'] = url;
      newData['headers'] = getHeaders();
      newData['rotaterate'] = rotaterate;
      newData['useragent'] = useragent;
      newData['authorization'] = authorization;  
      newData['remote'] = remote;
      newData['remotescheduleurl'] = remotescheduleurl;
      newData['schedulepollinterval'] = schedulepollinterval;
      
      $.ajax({
        url: "http://"+address+'/data',
        type: 'PUT',
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        data: JSON.stringify(newData),
        success: reload
      })
    }
  });

  function reload(){
    $('#loading').text('Restarting...');
    $('#loading').append('<h5>5</h5>');
    var timerInterval = setInterval(function(){
      var currentTime = parseInt($('#loading > h5').text(),10);
      if(currentTime > 1){
        $('#loading > h5').text(currentTime - 1);
      }
    }, 1000);
    setTimeout(function(){
      clearInterval(timerInterval);
      window.location.reload();
    }, 5 * 1000 + 500);
  }

})



function addHeader(header){
  $('#headers').append(`<li class="header-element">
  <input id="header-name" value="${header.name}" class="input-field col s5" type="text" placeholder="Header name"/>
  <input id="header-value" value="${header.value}" class="input-field col offset-s1 s5" type="text" placeholder="Value"/>
  <br/></li>`);
}

function getHeaders(){
  let headers = []
  $(".header-element" ).each( function( index, element ){
    let headerName = $( this ).find("#header-name").val();
    let headerValue = $( this ).find("#header-value").val();
    if (headerName && headerValue){
      headers.push({name: headerName, value: headerValue});
    }
  });
  return headers;
}

