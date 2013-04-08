/*
 * Usage example:

  $('.text').serraCounter({
      message: false, // Use false to show just the numbers or a String to define a custom message
      counter: { // The examples are below...
          scope: 'parent',
          selector: '.serra-counter'
      },
      onoverlimit: function () { // Trigged when over the limit (option alias: ool)
          $(this).parents('form').find('button').attr("disabled", "disabled")
      },
      onlimit: function () { // Trigged when inside of the limit (option alias: ol)
          $(this).parents('form').find('button').removeAttr("disabled")
      }
  });

  // Counter options examples:
  // counter: {
  //   scope: 'global', // Default
  //   selector: '.serra-counter' // Default
  // }

  // counter: {
  //   scope: {parents: 'div:first'}, // Use this selector to define the scope to search the counter element;
  // }

  // counter: {
  //   scope: 'parent', // Use the parent node to define the search scope
  //   selector: '.serra-counter' // or '.your-selector'
  // }

  * See more examples in the example folder!!!
*/

(function( $ ){
    function Counter (target, config) {
        var _config = $.extend({
            'scope'   : 'global',
            'selector': '.serra-counter',
            'overLimitClass': 'overlimit'
        }, config);

        this.target   = target;
        this.scope    = _config.scope;
        this.selector = _config.selector;
        this.overLimitClass = _config.overLimitClass;
    }

    Counter.prototype = {
        scopeType: function () {
            var strScope = String(this.scope).toLowerCase()
            return strScope.match(/\w+/)[0];
        },

        $el: function () {
            switch (this.scopeType()) {
                case 'global':
                    return $(this.selector);
                    break;
                case 'parent':
                    return this.target.parent().find(this.selector);
                    break;
                case 'object':
                    return this.target.parents(this.scope.parents).find(this.selector);
                    break;
                default:
                    $.error('jQuery.serraCounter: Invalid scope');
            }
        },

        updateWith: function (number, message) {
            this.$el().text(message ? number + ' ' + message : number);
            return true;
        },

        cssClass: function (action) {
            var method = action + 'Class';
            this.$el()[method](this.overLimitClass);
        }
    }

    Counter.Event = function (counter, options) {
        var runCustomEvents = function(name, context) {
            var _event;

            switch (name) {
                case 'overlimit':
                    _event = (options.onoverlimit || options.ool);
                    break;
                case 'onlimit':
                    _event = (options.onlimit || options.ol);
                    break;
                default:
                    $.error('jQuery.serraCounter: Invalid event');
            }

            _event && _event.apply(context);
        };

        return function () {
            var leftChars = (options.limit - this.value.length)

            if (leftChars < 0) {
                counter.cssClass('add');
                runCustomEvents('overlimit', this);
            } else {
                counter.cssClass('remove');
                runCustomEvents('onlimit', this);
            };

            counter.updateWith(leftChars, options.message);
        }
    }

    $.fn.serraCounter = function (options) {
        var _options = $.extend({
          'limit'  : 140,
          'message': 'character(s) left',
        }, options);

        return this.each(function (i, target) {
            var _counterEvent,
                $target = $(target),
                counter = new Counter($target, _options.counter);

            counter.updateWith(_options.limit, _options.message);

            _counterEvent = Counter.Event(counter, _options);

            $target.keyup(_counterEvent);
            $target.keydown(_counterEvent);
        });
    }
})( jQuery );
