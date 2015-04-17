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

            var allLists = null, currentIndex = -1;

            setTimeout(function() {
                allLists = angular.element('.sortableList'); // Every sortable list
                currentIndex = allLists.index(element); // This lists position out of every list
            })

            var settings = {
                draggable: scope.draggable ? scope.draggable : '.card',
                duration: 200
            };

            var dragging = null, placeholder = null, offsetY = 0, offsetX = 0, marginTop = 0;
            var cardSet = null, initialIndex, currentIndex, animating = false, changingSlide = false;

            var initialDragThreshold = element[0].children[0].clientWidth / 2;
            var dragThreshold = initialDragThreshold;
            

            var placeholderHeight;
            var scrollInterval;

            scope.$on('dragStart', function(event, data) {
                
                /*
                    Card from another list has been dropped in this list.
                    TODO: Add target ID as this function will be picked up by multiple
                    lists.
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
                    console.log("REMOVING DUP ELEM");
                    dragging.remove(); // Remove inserted DOM element
                }

            })

            var createPlaceholder = function createPlaceholder(height) {
                // Use marginTop to compensate for extra margin when animating the placeholder
                return $('<div></div>')
                        .css({
                            height: height + 'px',
                            marginTop: (currentIndex > 0 ? -marginTop : -1) + 'px'
                        })
                        .addClass('placeholder');
            };

            var touchHold = function touchHold(e) {
                // Get the element we're about to start dragging
                dragging = angular.element(e.target).closest(settings.draggable);
                dragging.fromId = scope.sortId;
                if (!dragging.length) dragging = null;

                if (dragging) {
                    // Get the initial index -- BUG With Modulo
                    var total = angular.element(settings.draggable).length;
                    initialIndex = currentIndex = dragging.index(settings.draggable);
                    console.log("BEFORE MOD: " + initialIndex);
                    if(initialIndex > scope.sortableData.length) {
                        initialIndex = currentIndex = total - dragging.index(settings.draggable);
                        initialIndex = currentIndex = scope.sortableData.length - initialIndex;
                        console.log("AFTER MOD: " + initialIndex);
                    }
                     

                    dragging.data = scope.sortableData[initialIndex];

                    var position = dragging.position();

                    // Get relative position of touch
                    var clientY = e.gesture.touches[0].clientY;
                    offsetY = clientY - position.top - element.offset().top;

                    var clientX = e.gesture.touches[0].clientX;
                    offsetX = clientX - position.left - element.offset().left;

                    // Switch to Absolute position at same location
                    dragging.css({
                        position: 'fixed',
                        zIndex: 1000,
                        left: position.left + 'px',
                        top: position.top + 'px',
                        width: dragging.outerWidth() + 'px'
                    })
                    .addClass('dragging');

                    // Get the set of cards that were re-ordering with
                    cardSet = element.find(settings.draggable + ':not(.dragging)');


                    // We need to know the margin size so we can compensate for having two
                    // margins where we previously had one (due to the placeholder being there)
                    marginTop = parseInt(dragging.css('marginTop')) + 1;

                    // Replace with placeholder (add the margin for when placeholder is full size)
                    placeholderHeight = dragging.outerHeight() + marginTop;
                    placeholder = createPlaceholder(placeholderHeight);
                    placeholder.insertAfter(dragging);
                    
                    dragging.placeholder = placeholder;
                    dragging.placeholderHeight = placeholderHeight;

                    // Interval to handle auto-scrolling window when at top or bottom
                    initAutoScroll();
                    scrollInterval = setInterval(autoScroll, 20);
                }
            };

            var holdGesture = $ionicGesture.on('hold', touchHold, element);

            var touchMove = function touchMove(e) {
                
                if (dragging) {
                    e.stopPropagation();
                    touchY = e.touches ? e.touches[0].clientY : e.clientY;
                    touchX = e.touches ? e.touches[0].clientX : e.clientX;
                    var newTop = touchY - offsetY - element.offset().top;
                    var newLeft = touchX - offsetX - element.offset().left;

                    // Reposition the dragged element
                    dragging.css({
                        'top': newTop + 'px',
                        'left': newLeft + 'px',
                        'position': 'fixed'
                    });


                    if(!changingSlide && newLeft > (dragThreshold) &&
                        ((currentIndex + 1) < allLists.length)) {
                        changingSlide = true;
                        dragging.targetId = angular.element(allLists[currentIndex + 1]).attr('sort-id');
                        $timeout(function() {
                            console.log(scope.sortId + " SWITCH");
                            console.log(newLeft);
                            scope.$apply(scope.outsideContainer);
                            $rootScope.$broadcast('dragStart', dragging);
                            placeholder.remove();
                            
                        }, 1000);
                    }
                    else {

                        // Check for position in the list
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
