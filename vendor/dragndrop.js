
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
module.directive('jquiTreeDragStart', ['$parse', function($parse) {
    return {
        link: function(scope, elem, attrs) {
            if ($parse(attrs.jquiTreeDraggable)(scope) === true) {
                var dragStartExp = attrs.jquiTreeDragStart || '';
                var dragEndExp = attrs.jquiTreeDragEnd || '';
                var handle = attrs.jquiTreeHandle || false;
                var axisExp = attrs.jquiTreeAxis;

                elem.addClass('jqui-tree-dnd-item');

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
                            elem.addClass('jqui-tree-dnd-item-dragging')
                                .data('jqui-tree-dnd-item-token', token = dragStart());
                            ui.helper.text(scope.getSelectedItems().length + ' item(s) selected.');
                        });
                    },
                    stop: function() {
                        scope.$apply(function() {
                            elem.removeClass('jqui-tree-dnd-item-dragging');
                            elem.removeClass('jqui-tree-dnd-item-over');
                            elem.removeData('jqui-tree-dnd-item-token');
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

    module.directive('jquiTreeDropCommit', ['$parse', function($parse) {
        return {
            link: function(scope, elem, attrs) {
                var isDroppable = $parse(attrs.jquiTreeDroppable)(scope);
                if (isDroppable === true) {
                    var acceptExp = attrs.jquiTreeDropAccept || '';
                    var commitExp = attrs.jquiTreeDropCommit || '';

                    elem.addClass('jqui-tree-dnd-target');
                    var accept = evalFn(elem, scope, acceptExp);
                    var commit = evalFn(elem, scope, commitExp);

                    elem.droppable({
                        //tolerance: 'fit',
                        greedy: true,
                        activate: function(event, ui) {
                            scope.$apply(function() {
                                var token = ui.draggable.data('jqui-tree-dnd-item-token');
                                if (accept(token)) {
                                    elem.addClass('jqui-tree-dnd-target-active');
                                } else {
                                    elem.addClass('jqui-tree-dnd-target-disable');
                                }
                            });
                        },
                        deactivate: function() {
                            elem.removeClass('jqui-tree-dnd-target-active')
                                .removeClass('jqui-tree-dnd-target-disable')
                                .removeClass('jqui-tree-dnd-target-over');
                        },
                        over: function(e, ui) {
                            if (elem.hasClass('jqui-tree-dnd-target-active')) {
                                elem.addClass('jqui-tree-dnd-target-over');
                                ui.draggable.addClass('jqui-tree-dnd-item-over');
                            }
                        },
                        out: function(e, ui) {
                            elem.removeClass('jqui-tree-dnd-target-over');
                            ui.draggable.removeClass('jqui-tree-dnd-item-over');
                        },
                        drop: function(e, ui) {
                            if (elem.hasClass('jqui-tree-dnd-target-active')) {
                                commit(ui.draggable.data('jqui-tree-dnd-item-token'));
                                ui.draggable.draggable('option', 'revertDuration', 0)
                                    .css({ top:'', left:'' })
                                    .draggable('option', 'stop')();
                            }
                            elem.removeClass('jqui-tree-dnd-target-active')
                                .removeClass('jqui-tree-dnd-target-disable')
                                .removeClass('jqui-tree-dnd-target-over');
                        }
                    });
                }
            }
        };
    }]);
