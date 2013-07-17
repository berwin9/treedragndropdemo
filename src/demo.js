(function(angular, _) {
    'use strict';
    var app = angular.module('treedragndrop', []);

    app.controller('DemoCtrl', ['FixtureData', function(FixtureData) {
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
            return FixtureData.get('primary');
        };

        this.getSecondaryTreeViewModel = function() {
            return FixtureData.get('secondary');
        };

        this.onSecondaryDragStart = function(itemViewModel, parentViewModel) {
            return {
                itemViewModels: _secondaryActiveQueue,
                parentViewModel: parentViewModel
            };
        };

        this.onPrimaryDropAccept = function() {
            return true;
        };

        // We receive the targetItem that the drop event occured on as well as a token object
        // that acts as a transport that holds the collection of items being dropped as well as their parent.
        // this lets us manipulate the data structure behind the treeview
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

        this.onSecondaryDragStop = function() {};

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

    app.factory('FixtureData', function() {
        var _fixtures = {
            primary: {
                children: [
                    {
                        label: 'level 1 node 1',
                        children: [
                            { label: 'level 2 node 1' },
                            { label: 'level 2 node 2' },
                            { label: 'level 2 node 3' }
                        ]
                    }
                ]
            },
            secondary: {
                children: [
                    {
                        label: 'level 1 node 1',
                        children: [
                            { label: 'level 2 node 1' },
                            { label: 'level 2 node 2' },
                            { label: 'level 2 node 3' },
                            { label: 'level 2 node 4' }
                        ]
                    }
                ]
            }
        };
        return {
            get: function(id) {
                return _fixtures[id];
            }
        };
    });
})(angular, _);
