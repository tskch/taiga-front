(function() {
    var multipleSortableClass = 'ui-multisortable-multiple';
    var mainClass = 'main-drag-item';

    var isBelow = function(elm, compare) {
        var elmOriginalPosition = elm.data('dragmultiple:originalPosition');
        var compareOriginalPosition = compare.data('dragmultiple:originalPosition');

        return elmOriginalPosition.top > compareOriginalPosition.top;
    };

    var reset = function(elm) {
        $(elm)
            .removeClass("ui-sortable-helper")
            .removeAttr('style')
            .data('dragMultipleActive', false);
    };

    var sort = function(positions) {
        var current = dragMultiple.items.elm;

        positions.after.reverse();

        $.each(positions.after, function () {
            reset(this);
            current.after(this);
        });

        $.each(positions.before, function () {
            reset(this);
            current.before(this);
        });
    };

    var sortPositions = function() {
        var current = dragMultiple.items.elm;
        var container = dragMultiple.items.container;

        //saved if the elements are after or before the current
        var insertAfter = [];
        var insertBefore = [];

        $(container).find('.' + multipleSortableClass).each(function () {
            var elm = $(this);


            if (elm.hasClass(mainClass) || !current.hasClass(multipleSortableClass)) return;

            if (isBelow(elm, current)) {
                insertAfter.push(elm);
            } else {
                insertBefore.push(elm);
            }
        });

        return {'after': insertAfter, 'before': insertBefore};
    };

    var drag = function() {
        var current = dragMultiple.items.elm;
        var container = dragMultiple.items.container;

        if (!dragMultiple.items.shadow) {
            dragMultiple.items.shadow = $('.' + mainClass +':last');

            var shadowData = dragMultiple.items.shadow.data('dragmultiple:originalPosition');

            current.data('dragmultiple:originalPosition', shadowData);
        }

        var shadow = dragMultiple.items.shadow;

        // following the drag element
        var currentLeft = shadow.position().left;
        var currentTop = shadow.position().top;
        var currentZIndex = shadow.css('z-index');
        var currentPosition = shadow.css('position');

        var positions = sortPositions();

        positions.before.reverse();

        [{'positions': positions.after, type: 'after'},
         {'positions': positions.before, type: 'before'}]
            .forEach(function (item) {
                $.each(item.positions, function (index, elm) {
                    var top;

                    if (item.type === 'after') {
                        top =  currentTop + ((index + 1) * current.outerHeight());
                    } else {
                        top =  currentTop - ((index + 1) * current.outerHeight());
                    }

                    elm
                        .addClass("ui-sortable-helper")
                        .css({
                            width: elm.outerWidth(),
                            height: elm.outerHeight(),
                            position: currentPosition,
                            zIndex: currentZIndex,
                            top: top,
                            left: currentLeft
                        });
                });
            });
    };

    var stop = function() {
        var current = dragMultiple.items.elm;
        var container = dragMultiple.items.container;

        $(window).off('mousemove.dragmultiple');

        //save the order of the elements relative to the main
        var positions = sortPositions(container, current);

        sort(positions);

        // reset
        dragMultiple.items = {};
        dragMultiple.activeMultiDrag = false;

        $('.' + mainClass).removeClass(mainClass);

        return $(container).find('.' + multipleSortableClass);
    };

    var dragMultiple = {
        activeMultiDrag: false
    };

    dragMultiple.prepare = function(elm, container) {
        var items = $(container).find('.' + multipleSortableClass);

        if (!$(elm).hasClass(multipleSortableClass) || !(items.length > 1)) {
            return;
        }

        dragMultiple.activeMultiDrag = true;

        dragMultiple.items = {};

        dragMultiple.items.elm = $(elm);
        dragMultiple.items.container = $(container);

        dragMultiple.items.elm.addClass(mainClass);

        if (dragMultiple.items.elm.hasClass(multipleSortableClass)) {
            dragMultiple.items.container.find('.' + multipleSortableClass).each(function () {
                $(this)
                    .data('dragmultiple:originalPosition', $(this).position())
                    .data('dragMultipleActive', true);
            });
        }
    };

    dragMultiple.start = function() {
        if (dragMultiple.activeMultiDrag) {
            $(window).on('mousemove.dragmultiple', function() {
                drag();
            });
        }
    };

    dragMultiple.stop = function() {
        if (dragMultiple.activeMultiDrag) {
            return stop();
        } else {
            return [];
        }
    };

    window.dragMultiple = dragMultiple;
}());



// (function($) {
//     var multipleSortableClass = 'ui-multisortable-multiple';
//     var dragStarted = false;

//     var multiSort = {};

//     multiSort.isBelow = function(elm, compare) {
//         var elmOriginalPosition = elm.data('dragmultiple:originalPosition');
//         var compareOriginalPosition = compare.data('dragmultiple:originalPosition');

//         return elmOriginalPosition.top > compareOriginalPosition.top;
//     };

//     multiSort.reset = function(elm) {
//         $(elm)
//             .removeClass("ui-sortable-helper")
//             .removeAttr('style')
//             .data('dragMultipleActive', false);
//     };

//     multiSort.sort = function(current, positions) {
//         positions.after.reverse();

//         $.each(positions.after, function () {
//             multiSort.reset(this);
//             current.after(this);
//         });

//         $.each(positions.before, function () {
//             multiSort.reset(this);
//             current.before(this);
//         });
//     };

//     multiSort.sortPositions = function(elm, current) {
//        //saved if the elements are after or before the current
//         var insertAfter = [];
//         var insertBefore = [];

//         $(elm).find('.' + multipleSortableClass).each(function () {
//             var elm = $(this);

//             if (elm[0] === current[0] || !current.hasClass(multipleSortableClass)) return;

//             if (multiSort.isBelow(elm, current)) {
//                 insertAfter.push(elm);
//             } else {
//                 insertBefore.push(elm);
//             }
//         });

//         return {'after': insertAfter, 'before': insertBefore};
//     };

//     $.widget( "ui.sortable", $.ui.sortable, {
//         _mouseStart: function() {
//             dragStarted = false;

//             this._superApply( arguments );
//         },
//         _createHelper: function () {
//             var helper = this._superApply( arguments );

//             if ($(helper).hasClass(multipleSortableClass)) {
//                 $(this.element).find('.' + multipleSortableClass).each(function () {
//                     $(this)
//                         .data('dragmultiple:originalPosition', $(this).position())
//                         .data('dragMultipleActive', true);
//                 });
//             }

//             return helper;
//         },
//         _mouseStop: function (event, ui) {
//             var current = this.helper;
//             var elms = [];

//             if (current.hasClass(multipleSortableClass)) {
//                 elms = $(this.element).find('.' + multipleSortableClass);
//             }

//             if (!elms.length) {
//                 elms = [current];
//             }

//             //save the order of the elements relative to the main
//             var positions = multiSort.sortPositions(this.element, current);

//             this._superApply( arguments );

//             if (this.element !== this.currentContainer.element) {
//                 // change to another sortable list
//                 multiSort.sort(current, positions);

//                 $(this.currentContainer.element).trigger('multiplesortreceive', {
//                     'item': current,
//                     'items': elms,
//                     'source': this.element
//                 });
//             } else if (current.hasClass(multipleSortableClass)) {
//                 // sort in the same list
//                 multiSort.sort(current, positions);
//             }

//             $(this.element).trigger('multiplesortstop', {
//                 'item': current,
//                 'items': elms
//             });
//         },
//         _mouseDrag: function(key, value) {
//             this._super(key, value);

//             var current = this.helper;

//             if (!current.hasClass(multipleSortableClass)) return;

//             // following the drag element
//             var currentLeft = current.position().left;
//             var currentTop = current.position().top;
//             var currentZIndex = current.css('z-index');
//             var currentPosition = current.css('position');

//             var positions = multiSort.sortPositions(this.element, current);

//             positions.before.reverse();

//             [{'positions': positions.after, type: 'after'},
//              {'positions': positions.before, type: 'before'}]
//                 .forEach(function (item) {
//                     $.each(item.positions, function (index, elm) {
//                         var top;

//                         if (item.type === 'after') {
//                             top =  currentTop + ((index + 1) * current.outerHeight());
//                         } else {
//                             top =  currentTop - ((index + 1) * current.outerHeight());
//                         }

//                         elm
//                             .addClass("ui-sortable-helper")
//                             .css({
//                                 width: elm.outerWidth(),
//                                 height: elm.outerHeight(),
//                                 position: currentPosition,
//                                 zIndex: currentZIndex,
//                                 top: top,
//                                 left: currentLeft
//                             });
//                     });
//             });

//             // it only refresh position the first time because
//             // jquery-ui has saved the old positions of the draggable elements
//             // and with this will remove all elements with dragMultipleActive
//             if (!dragStarted) {
//                 dragStarted = true;
//                 this.refreshPositions();
//             }
//         }
//     });
// }(jQuery))
