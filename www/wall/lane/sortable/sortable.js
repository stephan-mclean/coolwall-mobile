angular.module('coolwallApp')
.directive('sortable', ['$ionicGesture', '$ionicScrollDelegate', '$rootScope', '$timeout', function ($ionicGesture, $ionicScrollDelegate, $rootScope, $timeout) {
    return {
        restrict: 'A',
        scope: {
            draggable: '@',
            sorted: '&',
            outsideContainer: '&',
            sortId: '@',
            sortableData: '='
        },
        link: function (scope, element, attrs) {

            /*
                Keep track of the lists for switching between containers
            */
            var allLists = null, currentIndex = -1;

            setTimeout(function() {
                allLists = angular.element('.sortableList'); // Every sortable list
                currentIndex = allLists.index(element); // This lists position out of every list
            }, 100);

            var settings = {
                draggable: scope.draggable ? scope.draggable : '.card',
                duration: 200
            };

            /*
                Global variables for the dragging
            */
            var dragging = null, placeholder = null, offsetY = 0, offsetX = 0, marginTop = 0;
            var cardSet = null, initialIndex, currentIndex, animating = false, changingSlide = false;

            /*
                The maximum x value before we are outside the current container
            */
            var initialDragThreshold = element[0].children[0].clientWidth / 2;
            var dragThreshold = initialDragThreshold;
            

            var placeholderHeight;
            var scrollInterval;

            scope.$on('dragStart', function(event, data) {
                
                /*
                    Card from another list has been dropped in this list.
                */
                if(data.targetId == scope.sortId) {
                    placeholder = data.placeholder;
                    placeholderHeight = data.placeholderHeight;
                    dragging = data;
                    angular.element(element[0].children[0]).prepend(dragging);
                    dragThreshold = dragThreshold + initialDragThreshold;
                    console.log(dragThreshold);
                    //placeholder.insertAfter(dragging);
                }

            });

            scope.$on('dragRelease', function(event, data) {
                /*
                    List item initially from this list has been
                    dropped in another list.
                */
                if(data.fromId == scope.sortId && data.targetId) {
                    
                    scope.$data = dragging.data;
                    scope.$fromIndex = initialIndex;
                    scope.$toIndex = undefined;

                    dragging = null;
                    changingSlide = false;
                    

                    scope.$apply(scope.sorted);
                }
                else if(data.targetId && data.targetId == scope.sortId) {
                    dragging.remove(); // Remove inserted DOM element
                }

            })

            /*
                Create the placeholder which will be animated
                to show the drop position of the card.
            */
            var createPlaceholder = function createPlaceholder(height) {
                return $('<div></div>')
                        .css({
                            height: height + 'px',
                            marginTop: (currentIndex > 0 ? -marginTop : -1) + 'px'
                        })
                        .addClass('placeholder');
            };

            /*
                Function to handle the 'hold' Ionic event.

                Get the element which the user is dragging. 
                Get the data object which is related to the element.

            */
            var touchHold = function touchHold(e) {
                // Get the element we're about to start dragging
                dragging = angular.element(e.target).closest(settings.draggable);
                dragging.fromId = scope.sortId;
                if (!dragging.length) dragging = null;

                if (dragging) {
                    // Get the initial index -- BUG With Modulo
                    var total = angular.element(settings.draggable).length;
                    initialIndex = currentIndex = dragging.index(settings.draggable);
                    if(initialIndex > scope.sortableData.length) {
                        initialIndex = currentIndex = total - dragging.index(settings.draggable);
                        initialIndex = currentIndex = scope.sortableData.length - initialIndex;
                    }
                     

                    // Data associated with dragged element
                    dragging.data = scope.sortableData[initialIndex];

                    var position = dragging.position();

                    // Get relative position of touch
                    var clientY = e.gesture.touches[0].clientY;
                    offsetY = clientY - position.top - element.offset().top;

                    var clientX = e.gesture.touches[0].clientX;
                    offsetX = clientX - position.left - element.offset().left;

                    /*
                        Add fixed position to card to allow it to be
                        dragged freely on the screen.
                    */
                    dragging.css({
                        position: 'fixed',
                        zIndex: 1000,
                        left: position.left + 'px',
                        top: position.top + 'px',
                        width: dragging.outerWidth() + 'px'
                    })
                    .addClass('dragging');

                    /*
                        The set of all other draggable cards which
                        will be reordered as the user drags the current card.
                    */
                    cardSet = element.find(settings.draggable + ':not(.dragging)');

                    marginTop = parseInt(dragging.css('marginTop')) + 1;

                    /*
                        Add the placeholder
                    */
                    placeholderHeight = dragging.outerHeight() + marginTop;
                    placeholder = createPlaceholder(placeholderHeight);
                    placeholder.insertAfter(dragging);
                    
                    /*
                        Store the placeholder in the element such that
                        if the user drags outside of this container, the
                        new container can pick up where this one left off.
                    */
                    dragging.placeholder = placeholder;
                    dragging.placeholderHeight = placeholderHeight;

                    // Interval to handle auto-scrolling window when at top or bottom
                    initAutoScroll();
                    scrollInterval = setInterval(autoScroll, 20);
                }
            };

            var holdGesture = $ionicGesture.on('hold', touchHold, element);

            /*
                Function to handle the 'move' Ionic event.
            */
            var touchMove = function touchMove(e) {
                
                if (dragging) {
                    e.stopPropagation();

                    /*
                        Get the drag location.
                    */
                    touchY = e.touches ? e.touches[0].clientY : e.clientY;
                    touchX = e.touches ? e.touches[0].clientX : e.clientX;
                    var newTop = touchY - offsetY - element.offset().top;
                    var newLeft = touchX - offsetX - element.offset().left;

                    /*
                        Reposition the dragged element
                    */  
                    dragging.css({
                        'top': newTop + 'px',
                        'left': newLeft + 'px',
                        'position': 'fixed'
                    });


                    /*
                        Check if the user wants to switch container.
                    */
                    if(!changingSlide && newLeft > (dragThreshold) &&
                        ((currentIndex + 1) < allLists.length)) {
                        changingSlide = true;

                        /* Store the ID of the next list in the set */
                        dragging.targetId = angular.element(allLists[currentIndex + 1]).attr('sort-id');
                        $timeout(function() {
                            /* 
                                Use the callback function which determines what happens
                                when the user drags out of the container 
                            */
                            scope.$apply(scope.outsideContainer);
                            /* Tell the next list to handle the dragging */
                            $rootScope.$broadcast('dragStart', dragging);
                            /* Remove the placeholder from this list */
                            placeholder.remove();
                        }, 1000);
                    }
                    else {

                        /*
                            Not switching lists so check for the new position
                            in the current list.
                        */

                        var newIndex = 0;
                        if(!cardSet) {
                            cardSet = element.find(settings.draggable + ':not(.dragging)');
                        }
                        cardSet.each(function (i) {
                            if (newTop > $(this).position().top) {
                                newIndex = i + 1;
                            }
                        });

                        if (!animating && newIndex !== currentIndex) {
                            currentIndex = newIndex;

                            var oldPlaceholder = placeholder;
                            // Animate in a new placeholder
                            placeholder = createPlaceholder(1);

                            // Put it in the right place
                            if (newIndex < cardSet.length) {
                                placeholder.insertBefore(cardSet.eq(newIndex));
                            } else {
                                placeholder.insertAfter(cardSet.eq(cardSet.length - 1));
                            }

                            // Animate the new placeholder to full height
                            animating = true;
                            setTimeout(function () {
                                placeholder.css('height', placeholderHeight + 'px');
                                // Animate out the old placeholder
                                oldPlaceholder.css('height', 1);

                                setTimeout(function () {
                                    oldPlaceholder.remove();
                                    animating = false;
                                }, settings.duration);
                            }, 50);
                        }
                    }
                }
            };

            var touchMoveGesture = $ionicGesture.on('touchmove', touchMove, element);
            var mouseMoveGesture = $ionicGesture.on('mousemove', touchMove, element);

            var touchRelease = function touchRelease(e) {
                changingSlide = false;
                dragThreshold = initialDragThreshold;
                if (dragging) {
                    // Set element back to normal
                    dragging.css({
                        position: '',
                        zIndex: '',
                        left: '',
                        top: '',
                        width: ''
                    }).removeClass('dragging');

                    // Remove placeholder
                    placeholder.remove();
                    angular.element('.placeholder').remove();
                    placeholder = null;

                    
                    // Call the callback with the instruction to re-order
                    scope.$fromIndex = initialIndex;
                    scope.$toIndex = currentIndex;
                    scope.$data = dragging.data;
                    

                    $rootScope.$broadcast('dragRelease', dragging);
                    
                    scope.$apply(scope.sorted);

                    dragging = null;
                    

                    clearInterval(scrollInterval);
                }
            };
            var releaseGesture = $ionicGesture.on('release', touchRelease, element);

            scope.$on('$destroy', function () {
                $ionicGesture.off(holdGesture, 'hold', touchHold);
                $ionicGesture.off(touchMoveGesture, 'touchmove', touchMove);
                $ionicGesture.off(mouseMoveGesture, 'mousemove', touchMove);
                $ionicGesture.off(releaseGesture, 'release', touchRelease);
            });

            var touchY, scrollHeight, containerTop, maxScroll;
            var scrollBorder = 80, scrollSpeed = 0.2;
            // Setup the autoscroll based on the current scroll window size
            var initAutoScroll = function initAutoScroll() {
                touchY = -1;
                var scrollArea = element.closest('.scroll');
                var container = scrollArea.parent();
                scrollHeight = container.height();
                containerTop = container.position().top;
                maxScroll = scrollArea.height() - scrollHeight;
            };

            // Autoscroll function to scroll window up and down when
            // the touch point is close to the top or bottom
            var autoScroll = function autoScroll() {
                var scrollChange = 0;
                if (touchY >= 0 && touchY < containerTop + scrollBorder) {
                    // Should scroll up
                    scrollChange = touchY - (containerTop + scrollBorder);
                } else if (touchY >= 0 && touchY > scrollHeight - scrollBorder) {
                    // Should scroll down
                    scrollChange = touchY - (scrollHeight - scrollBorder);
                }

                if (scrollChange !== 0) {
                    // get the updated scroll position
                    var newScroll = $ionicScrollDelegate.getScrollPosition().top + scrollSpeed * scrollChange;
                    // Apply scroll limits
                    if (newScroll < 0)
                        newScroll = 0;
                    else if (newScroll > maxScroll)
                        newScroll = maxScroll;

                    // Set the scroll position
                    $ionicScrollDelegate.scrollTo(0, newScroll, false);
                }
            };

        }
    };
}]);
