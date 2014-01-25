/*
 Chrome
 */

var SYNC_Storage = chrome.storage.sync;
var BG_PAGE = chrome.extension.getBackgroundPage();
var CACHED_SETTINGS = BG_PAGE.CACHED_SETTINGS;

// SYNC_Storage.get(null, function(items) {
//     console.log(items);
// });

function get_i18n(message_name) {
    return chrome.i18n.getMessage(message_name);
}

/*
 Alertify
 */

alertify.set({
    delay: 2000
});

/*
 Angular
 */

function play_sound(name) {
    var sounds = {
        'Hadouken': '../sounds/StreetFighter-Hadouken.mp3',
        'Shouryuuken': '../sounds/StreetFighter-Shouryuuken.mp3',
        'YeahBaby': '../sounds/AustinPowers-YeahBaby.mp3',
        'WahWahWaaah': '../sounds/WahWahWaaah.mp3'
    };

    var audio_url = sounds[name];
    var audio = new Audio(audio_url);
    audio.play();
}

// TODO: validation
function is_valid_url(url) {
    if (!url) {
        return false;
    }
    else {
        return true;
    }
}

var app = angular.module('app', ['xeditable']);

app.controller('OptionController', [
  '$scope', '$element',
  function OptionController($scope, $element) {
    angular.element('#header_title').html(get_i18n('extension_name'));
    angular.element('#subtitle').html(get_i18n('subtitle'));
    angular.element('#quote').html(get_i18n('quote'));
    angular.element('#label_spacing_mode').html(get_i18n('label_spacing_mode'));
    angular.element('#label_spacing_rule').html(get_i18n('label_spacing_rule'));

    $scope.spacing_mode = CACHED_SETTINGS['spacing_mode'];
    $scope.spacing_mode_display = get_i18n($scope.spacing_mode);
    $scope.spacing_when_click_msg = get_i18n('spacing_when_click_msg');
    $scope.change_spacing_mode = function() {
        play_sound('Hadouken');

        if ($scope.spacing_mode == 'spacing_when_load') {
            $scope.spacing_mode = 'spacing_when_click';
        }
        else if ($scope.spacing_mode == 'spacing_when_click') {
            $scope.spacing_mode = 'spacing_when_load';
        }

        $scope.spacing_mode_display = get_i18n($scope.spacing_mode);

        SYNC_Storage.set({'spacing_mode': $scope.spacing_mode}, function() {
            // SYNC_Storage.get(null, function(items) {
            //     console.log(items);
            // });
        });
    };

    $scope.spacing_rule = CACHED_SETTINGS['spacing_rule'];
    $scope.spacing_rule_display = get_i18n($scope.spacing_rule);
    $scope.blacklists = CACHED_SETTINGS['blacklists'];
    $scope.whitelists = CACHED_SETTINGS['whitelists'];
    $scope.change_spacing_rule = function() {
        play_sound('Shouryuuken');

        // TODO: 如果 spacing_mode 超過兩種以上的值就不能用這種 toggle 的方式了
        if ($scope.spacing_rule == 'blacklists') {
            $scope.spacing_rule = 'whitelists';
        }
        else if ($scope.spacing_rule == 'whitelists') {
            $scope.spacing_rule = 'blacklists';
        }

        $scope.spacing_rule_display = get_i18n($scope.spacing_rule);

        SYNC_Storage.set({'spacing_rule': $scope.spacing_rule}, function() {
            // SYNC_Storage.get(null, function(items) {
            //     console.log(items);
            // });
        });
    };

    $scope.update_urls = function(url) {
        if (is_valid_url(url)) {
            play_sound('YeahBaby');

            var spacing_rule = $scope.spacing_rule; // 'blacklists' or 'whitelists'
            var urls = $scope[spacing_rule];
            var obj_to_save = {};
            obj_to_save[spacing_rule] = urls;

            SYNC_Storage.set(obj_to_save, function() {
                // SYNC_Storage.get(null, function(items) {
                //     console.log(items);
                // });
            });
        }
        else {
            play_sound('WahWahWaaah');
            alertify.error('Fail to save');

            return '';
        }

        event.preventDefault();
    };

    $scope.remove_url = function(array_index) {
        var spacing_rule = $scope.spacing_rule;
        var urls = $scope[spacing_rule];
        urls.splice(array_index, 1);

        var obj_to_save = {};
        obj_to_save[spacing_rule] = urls;
        SYNC_Storage.set(obj_to_save, function() {
            // SYNC_Storage.get(null, function(items) {
            //     console.log(items);
            // });
        });

        event.preventDefault();
    };

    $scope.url_to_add = {};
    $scope.url_to_add.for_blacklist = '';
    $scope.url_to_add.for_whitelist = '';
    $scope.add_url = function(new_url) {
        if (is_valid_url(new_url)) {
            play_sound('YeahBaby');

            var spacing_rule = $scope.spacing_rule;
            var urls = $scope[spacing_rule];
            urls.push(new_url);

            var obj_to_save = {};
            obj_to_save[spacing_rule] = urls;
            SYNC_Storage.set(obj_to_save, function() {
                // SYNC_Storage.get(null, function(items) {
                //     console.log(items);
                // });
            });
        }
        else {
            play_sound('WahWahWaaah');
            alertify.error('Fail to save');

            return '';
        }

        event.preventDefault();
    };

    $scope.reset_click_to_add = function() {
        $scope.url_to_add = {};
        $scope.url_to_add.for_blacklist = '';
        $scope.url_to_add.for_whitelist = '';
    };

  }
]);

app.run(function(editableOptions, editableThemes) {
  // set `default` theme
  editableOptions.theme = 'default';

  // overwrite submit button template
  editableThemes['default'].submitTpl = '<button class="pure-button small-button">save</button>';
  editableThemes['default'].cancelTpl = '<button class="pure-button small-button" ng-click="$form.$cancel()">cancel</button>';
});
