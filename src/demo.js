(function(angular, _) {
    'use strict';
    var app = angular.module('treedragndrop', []);

    // Demo on how to use the dynamic tree
    app.controller('DemoController', [function() {
        var _primaryActiveQueue = null;
        var _secondaryActiveQueue = null;

        this.onPrimaryTreeClick = function(e, treeNodeViewModel, index, selected) {
            _primaryActiveQueue = selected;
        };

        this.onSecondaryTreeClick = function(e, treeNodeViewModel, index, selected) {
            _secondaryActiveQueue = selected;
        };


        this.getChildren = function(item) {
            return item.children;
        };

        this.getLabel = function(item) {
            return item.label;
        };

        this.getPrimaryTreeViewModel = function() {
            var primary = {
                children: [
                    {
                        label: 'tree 1 level 1 node 1',
                        children: [
                            { label: 'tree 1 level 2 node 1' },
                            { label: 'tree 1 level 2 node 2' },
                            { label: 'tree 1 level 2 node 3' }
                        ]
                    }
                ]
            };
            return primary;
        };

        this.getSecondaryTreeViewModel = function() {
            var secondary = {
                children: [
                    {
                        label: 'tree 2 level 1 node 1',
                        children: [
                            { label: 'tree 2 level 2 node 1' },
                            { label: 'tree 2 level 2 node 2' },
                            { label: 'tree 2 level 2 node 3' },
                            { label: 'tree 2 level 2 node 4' }
                        ]
                    }
                ]
            };
            return secondary;
        };

        this.onSecondaryDragStart = function(itemViewModel, parentViewModel) {
            console.log(itemViewModel === parentViewModel);
            return {
                itemViewModels: _secondaryActiveQueue,
                parentViewModel: parentViewModel
            };
        };

        this.onPrimaryDropAccept = function() {
            return true;
        };

        this.onPrimaryDrop = function(targetItem, token) {
            _.each(token.itemViewModels, function(itemViewModel) {
                var collection = token.parentViewModel.children;
                var index = collection.indexOf(itemViewModel);
                var item = collection[index];
                token.parentViewModel.children.splice(index, 1);
                if (_.isArray(targetItem.children)) {
                    targetItem.children.push(item);
                } else {
                    targetItem.children = [item];
                }
            });
        };

        this.onSecondaryDragStop = function() {
            console.log('drag stop');
        };

        this.isPrimaryActive = function(item) {
            return _.any(_primaryActiveQueue, function(activeItem) {
                return activeItem === item;
            });
        };

        this.isSecondaryActive = function(item) {
            return _.any(_secondaryActiveQueue, function(activeItem) {
                return activeItem === item;
            });
        };
    }]);
})(angular, _);
