(function(angular, _) {
    'use strict';
    var module = angular.module('treedragndrop');

    module.directive('ensTree', ['$parse', function($parse) {
        function binaryFindInsertPos(list, item) {
            return _.sortedIndex(list, item, function(curitem) {
                return curitem.index;
            });
        }

        function buildInsertToken(item, index, depth) {
            return { depth: depth, index: index, item: item };
        }
        return {
            templateUrl: 'src/templates/treeroot.html',
            scope: true,
            link: function ensTreeLink(scope, elem, attrs) {
                var _selectedItems = [];
                var _prevSelectedPos = -1;
                var getter = $parse(attrs.ensTree)(scope);
                var onContextmenu = getter.onContextMenu || null;
                scope.item = getter.root;
                // assign all hooks to be used in the templates. let the user of the component
                // determine the behavior
                scope.getChildren = getter.getChildren;
                scope.getLabel = getter.getLabel;
                scope.isActive = getter.isActive;
                scope.isDraggable = !!getter.draggable;
                scope.isDroppable = !!getter.droppable;
                scope.onDropAccept = getter.onDropAccept || angular.noop;
                scope.onDrop = getter.onDrop || angular.noop;
                scope.onDragStart = getter.onDragStart || angular.noop;
                scope.__depth = 1;
                scope.__col = scope.getChildren(scope.item);
                scope.getSelectedItems = function() {
                    return _selectedItems;
                };

                // we use ng-click so we don't have to run $apply here.
                // we add a fromDraggable flag so that if the invocation comes from the ensTreeDragNDrop
                // directive we don't deselect the currently active items since the user is probably
                // initiating a drag n drop
                /*jshint maxcomplexity: 10*/
                scope.onClick = function($event, item, $index, depth, fromDraggable, collection) {
                    var startPos, endPos;
                    function dispatchClickHandler() {
                        getter.onClick($event, item, $index, _.map(_selectedItems, function(item) {
                            return item.item;
                        }));
                    }
                    var clearSelectedItems = false;
                    var isDuplicateInsert = false;
                    var insertItem = buildInsertToken(item, $index, depth);
                    var insertPos = 0;

                    // handle both nix systems and windows
                    var metaKeyOn = !(!$event.metaKey && !$event.ctrlKey);
                    var shiftKeyOn = $event.shiftKey;

                    // if the node we are about to insert is not on the same level then go ahead
                    // and throw away the contents of _selectedItems and push the new item into _selectedItems
                    if (_selectedItems.length && depth !== _selectedItems[0].depth) {
                        _selectedItems.length = 0;
                        _prevSelectedPos = insertItem.index;
                        _selectedItems.push(insertItem);
                        dispatchClickHandler();
                        return;
                    }

                    insertPos = binaryFindInsertPos(_selectedItems, insertItem);

                    // checking the reference through `item` === `item` isnt enough since somebody
                    // could build a datasture where an item is in two places on the tree structure so
                    // we also have to check for the depth and the index
                    if (_selectedItems[insertPos] &&
                        _selectedItems[insertPos].depth === insertItem.depth &&
                        _selectedItems[insertPos].index === insertItem.index &&
                        _selectedItems[insertPos].item === insertItem.item) {
                        isDuplicateInsert = true;
                    }

                    //TODO: be aware that if we allow new child nodes to be added to the tree
                    //then the index that we are caching is no longer valid. we can fix this by either
                    //invalidating/throw away whats stored on the _selectedItems array or
                    //requery the dom get the scope from the dom elements and recache
                    if (shiftKeyOn && !metaKeyOn) {
                        _selectedItems.length = 0;
                        if (_prevSelectedPos >= insertItem.index) {
                            startPos = insertItem.index;
                            endPos = _prevSelectedPos;
                        } else {
                            startPos = _prevSelectedPos;
                            endPos = insertItem.index;
                        }
                        for (; startPos <= endPos; ++startPos) {
                            _selectedItems.push(buildInsertToken(collection[startPos], startPos, depth));
                        }
                        dispatchClickHandler();
                        return;
                    } else if (metaKeyOn) {
                        _prevSelectedPos = insertItem.index;
                        if (!isDuplicateInsert) {
                            _selectedItems.splice(insertPos, 0, insertItem);
                        }
                        dispatchClickHandler();
                        return;
                    }

                    // this is the default behavior when you just click on a item
                    // without any other key combination. we try to distinguish a normal click event
                    // from a click event instigated by a drag and drop where we don't want to clear
                    // the items.
                    // also if it is from draggable and it is not already in the list, we clear the `_selectedItems`
                    // and just set this current selectedItem as the active one.
                    // this mimics normal windows behavior for click/drag functionality
                    if (!fromDraggable || (fromDraggable && !isDuplicateInsert)) clearSelectedItems = true;
                    if (clearSelectedItems) {
                        _selectedItems.length = 0;
                        _prevSelectedPos = insertItem.index;
                        _selectedItems.splice(insertPos, 0, insertItem);
                    }
                    dispatchClickHandler();
                    return;
                };
                // be aware that we aren't running scope.$apply here since i don't think
                // we need to do anything when a tree node is toggled (this may change in the future)
                elem.on('click', '.icon-tree-toggle', function(e) {
                    $(e.target).closest('.tree-node').toggleClass('open');
                });

                if (onContextmenu != null) {
                    elem.on('contextmenu', 'li', function(e) {
                        onContextmenu(e);
                    });
                }
            }
        };
    }]);
})(angular, _);
