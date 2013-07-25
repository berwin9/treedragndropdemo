// drag start and drop commit directives code inspired by https://github.com/angular/angular-jquery-ui and
// https://github.com/danielzen/angular-jquery-ui/blob/master/app/js/jquery-ui-ng.js
(function(angular) {
    'use strict';
    var module = angular.module('treedragndrop');

    function evalFn(element, scope, exp, property) {
        property = property || '$token';
        return function(token) {
            var old = scope.hasOwnProperty(property) ? scope[property] : undefined;
            scope[property] = token;
            var retVal = scope.$eval(exp, element);
            scope[property] = old;
            return retVal;
        };
    }

    module.directive('ensTreeDragStart', ['$parse', function($parse) {
        return {
            link: function ensTreeDragStart(scope, elem, attrs) {
                if ($parse(attrs.ensTreeDraggable)(scope) === true) {
                    var dragStartExp = attrs.ensTreeDragStart || '';
                    var dragEndExp = attrs.ensTreeDragEnd || '';
                    var handle = attrs.ensTreeHandle || false;
                    var axisExp = attrs.ensTreeAxis;

                    elem.addClass('ens-tree-dnd-item');

                    var dragStart = evalFn(elem, scope, dragStartExp);
                    var dragEnd = evalFn(elem, scope, dragEndExp);
                    var token;

                    elem.draggable({
                        zIndex: 1051,
                        handle: handle,
                        appendTo: 'body',
                        helper: function(e) {
                            return $('<li></li>');
                        },
                        delay: 100,
                        start: function(e, ui) {
                            // we can't execute this at the html level because we lose access to the current event `e`
                            scope.onClick(e, scope.item, scope.$index, scope.__depth, true);
                            scope.$apply(function() {
                                elem.addClass('ens-tree-dnd-item-dragging')
                                    .data('ens-tree-dnd-item-token', token = dragStart());
                                ui.helper.text(scope.getSelectedItems().length + ' item(s) selected.');
                            });
                        },
                        stop: function() {
                            scope.$apply(function() {
                                elem.removeClass('ens-tree-dnd-item-dragging');
                                elem.removeClass('ens-tree-dnd-item-over');
                                elem.removeData('ens-tree-dnd-item-token');
                                dragEnd(token);
                                token = null;
                            });
                        }
                    });

                    if (axisExp) {
                        scope.$watch(axisExp, function (newValue) {
                            elem.draggable('option', 'axis', newValue);
                        });
                    }
                }
            }
        };
    }]);

    module.directive('ensTreeDropCommit', ['$parse', function($parse) {
        return {
            link: function ensTreeDropCommit(scope, elem, attrs) {
                var isDroppable = $parse(attrs.ensTreeDroppable)(scope);
                if (isDroppable === true) {
                    var acceptExp = attrs.ensTreeDropAccept || '';
                    var commitExp = attrs.ensTreeDropCommit || '';

                    elem.addClass('ens-tree-dnd-target');
                    var accept = evalFn(elem, scope, acceptExp);
                    var commit = evalFn(elem, scope, commitExp);

                    elem.droppable({
                        //tolerance: 'fit',
                        greedy: true,
                        activate: function(event, ui) {
                            scope.$apply(function() {
                                var token = ui.draggable.data('ens-tree-dnd-item-token');
                                if (accept(token)) {
                                    elem.addClass('ens-tree-dnd-target-active');
                                } else {
                                    elem.addClass('ens-tree-dnd-target-disable');
                                }
                            });
                        },
                        deactivate: function() {
                            elem.removeClass('ens-tree-dnd-target-active')
                                .removeClass('ens-tree-dnd-target-disable')
                                .removeClass('ens-tree-dnd-target-over');
                        },
                        over: function(e, ui) {
                            if (elem.hasClass('ens-tree-dnd-target-active')) {
                                elem.addClass('ens-tree-dnd-target-over');
                                ui.draggable.addClass('ens-tree-dnd-item-over');
                            }
                        },
                        out: function(e, ui) {
                            elem.removeClass('ens-tree-dnd-target-over');
                            ui.draggable.removeClass('ens-tree-dnd-item-over');
                        },
                        drop: function(e, ui) {
                            if (elem.hasClass('ens-tree-dnd-target-active')) {
                                commit(ui.draggable.data('ens-tree-dnd-item-token'));
                                ui.draggable.draggable('option', 'revertDuration', 0)
                                    .css({ top:'', left:'' });
                                    // TODO: fix bug wherein we call stop when the item has
                                    // already been removed from the current collection
                                    //.draggable('option', 'stop')();
                            }
                            elem.removeClass('ens-tree-dnd-target-active')
                                .removeClass('ens-tree-dnd-target-disable')
                                .removeClass('ens-tree-dnd-target-over');
                        }
                    });
                }
            }
        };
    }]);
})(angular);
