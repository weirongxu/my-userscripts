// ==UserScript==
// @name         sms enhance
// @namespace    https://gist.github.com/weirongxu/c0d241ff3d94b2140570bf56124b382a
// @version      0.1
// @description  sms enhance
// @author       Raidou
// @match        *://sms.sg/*
// @require      https://code.jquery.com/jquery-latest.js
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  jQuery.fn.filterByText = function(textbox) {
    return this.each(function() {
      var select = this;
      var options = [];
      $(select).find('option').each(function() {
        options.push({
          value: $(this).val(),
          text: $(this).text()
        });
      });
      $(select).data('options', options);

      $(textbox).on('change keyup', function() {
        var options = $(select).empty().data('options');
        var search = $.trim($(this).val());
        var regex = new RegExp(search, "gi");

        $.each(options, function(i) {
          var option = options[i];
          if (option.text.match(regex) !== null) {
            $(select).append(
              $('<option>').text(option.text).val(option.value)
            );
          }
        });
      });
    });
  };

  const autoSave = ($dom, name) => {
    $dom.val(localStorage.getItem(name));
    $dom.trigger('change');
    $dom.on('keyup', () => {
      console.log($dom.val());
      localStorage.setItem(name, $dom.val());
    });
  };

  $(() => {
    const $num = $('[name="sms_num"]');
    const $sendToSeed = $num.after('<br><button type="button">send to "Seed"</button>').next().next();
    $sendToSeed.on('click', () => {
      $num.val('81099249');
    });
    autoSave($num, 'num');
    autoSave($('[name="message"]'), 'message');

    const $groups = $('[name="sms_grp"]');
    const $groupsFilter = $groups.before('<input><br>').prev().prev();
    $groups.filterByText($groupsFilter);

    autoSave($groupsFilter, 'groups-filter');
  });
})();
