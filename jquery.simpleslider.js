/*
 * by Wani(me@wani.kr)
 */
;(function(global, factory){
    if ( typeof define === 'function' && define.amd ) {
        define(['jquery'], factory);
    }
    else {
        factory(jQuery);
    }
})(this, function($) {

    var
    doNothing = function() {},
    defaultSettings = {
        type: 'fade',
        duration: 450,
        easing: "swing",
        interval: 5000,

        controller: false,

        nextButton: null,
        prevButton: null,

        nextType: null,
        prevType: null,

        animations: {},

        autoplay: true
    },
    defaultAnimations = {
        fade: function(currentSlide, nextSlide, complete, settings) {
            currentSlide.fadeOut({
                duration: settings.duration,
                easing: settings.easing
            });
            nextSlide.fadeIn({
                duration: settings.duration,
                easing: settings.easing,
                complete: complete
            });
        },
        slideLeft: function(currentSlide, nextSlide, complete, settings) {
            var width = currentSlide.parent().width();
            currentSlide.css({
                left: 0
            }).animate({
                left: (-1)*width
            }, {
                duration: settings.duration,
                easing: settings.easing,
                complete: function() {
                    $(this).hide();
                }
            });
            nextSlide.show().css({
                left: width
            }).animate({
                left:0
            }, {
                duration: settings.duration,
                easing: settings.easing,
                complete: complete
            });
        },
        slideRight: function(currentSlide, nextSlide, complete, settings) {
            var width = currentSlide.parent().width();
            currentSlide.css({
                left: 0
            }).animate({
                left: width
            }, {
                duration: settings.duration,
                easing: settings.easing,
                complete: function() {
                    $(this).hide();
                }
            });
            nextSlide.show().css({
                left: (-1)*width
            }).animate({
                left:0
            }, {
                duration: settings.duration,
                easing: settings.easing,
                complete: complete
            });
        },
        slideUp: function(currentSlide, nextSlide, complete, settings) {
            var height = currentSlide.parent().height();
            currentSlide.css({
                top: 0
            }).animate({
                top: (-1)*height
            }, {
                duration: settings.duration,
                easing: settings.easing,
                complete: function() {
                    $(this).hide();
                }
            });
            nextSlide.show().css({
                top: height
            }).animate({
                top: 0
            }, {
                duration: settings.duration,
                easing: settings.easing,
                complete: complete
            });
        },
        slideDown: function(currentSlide, nextSlide, complete, settings) {
            var height = currentSlide.parent().height();
            currentSlide.css({
                top: 0
            }).animate({
                top: height
            }, {
                duration: settings.duration,
                easing: settings.easing,
                complete: function() {
                    $(this).hide();
                }
            });
            nextSlide.show().css({
                top: (-1)*height
            }).animate({
                top: 0
            }, {
                duration: settings.duration,
                easing: settings.easing,
                complete: complete
            });
        },
        parallel: function(currentSlide, nextSlide, complete, settings) {
            var width = currentSlide.parent().width();
            var slides = currentSlide.parent().children();
            var next = nextSlide.index();
            var current = currentSlide.index();
            slides.show();
            slides.each(function(idx, slide) {
                var $slide = $(slide);
                if (idx === 0) {
                    $slide.css({
                        left: width * (idx - current)
                    }).animate({
                        left: width * (idx - next)
                    }, {
                        duration: settings.duration,
                        easing: settings.easing,
                        complete: complete
                    });
                } else {
                    $slide.css({
                        left: width * (idx - current)
                    }).animate({
                        left: width * (idx - next)
                    }, {
                        duration: settings.duration,
                        easing: settings.easing
                    });
                }
            });
        }
    };

    $.fn.simpleslider = function(_settings) {

        var
        settings = $.extend({}, defaultSettings, _settings),
        animations = $.extend({}, defaultAnimations, settings.animations),

        $this = this,
        $slides = $this.find("> *"),
        slidesLength = $slides.length,

        $window = $(window),
        $controller = null,

        isAnimating = false,

        initialize = function() {

            $slides.not(':first-child').hide();
            $slides.css({
                position: 'absolute',
                left: 0,
                top: 0
            });

            var startTarget = $slides.filter('.active');
            if (startTarget.length === 0) {
                startTarget = $slides.eq(0).addClass('active');
            } else if (startTarget.length > 1) {
                startTarget = startTarget.eq(0).addClass('active');
                startTarget.siblings().removeClass('active');
            }

            if (settings.controller) {
                var i;
                $controller = $("<div class=\"simpleslider-controller\"></div>");
                for (i = 0; i < slidesLength; i++ ) {
                    $controller.append($("<a class=\"button-" + i + "\"></a>"));
                }
                $controller.find("a").eq(startTarget.index()).addClass("active");
                $this.after($controller);

                $controller.find("a").bind("click", function() {
                    if ($(this).hasClass("active")) return;
                    changeSlide($(this).index());
                });
            }

            if (settings.nextButton) {
                $(settings.nextButton).bind("click", function() {
                    nextSlide();
                });
            }

            if (settings.prevButton) {
                $(settings.prevButton).bind("click", function() {
                    prevSlide();
                });
            }

            setInterval(function() {
                if (settings.autoplay) {
                    nextSlide();
                }
            }, settings.interval);

            $this.trigger('simpleslider.initialize');
        },
        nextSlide = function(type) {
            var current = $slides.filter('.active').index();
            changeSlide(
                (current+1)%slidesLength,
                type || settings.nextType,
                'next'
            );
        },
        prevSlide = function(type) {
            var current = $slides.filter('.active').index();
            changeSlide(
                (current-1+slidesLength)%slidesLength,
                type || settings.prevType,
                'prev'
            );
        },
        changeSlide = function(nextSlideIndex, type, from) {

            if (isAnimating) return;
            isAnimating = true;
            from = from || 'change';

            var animation = animations[type || settings.type] || animations.fade;
            var currentSlide = $slides.filter('.active');
            var nextSlide = $slides.eq(nextSlideIndex);

            $this.trigger('simpleslider.animateBefore', [currentSlide, nextSlide, from]);

            nextSlide.addClass('active').siblings().removeClass('active');
            animation(
                currentSlide,
                nextSlide,
                function() {
                    isAnimating = false;
                    $this.trigger('simpleslider.animateAfter', [currentSlide, nextSlide]);
                },
                settings
            );

            if (settings.controller) {
                $controller.find("a").removeClass("active").eq(nextSlideIndex).addClass("active");
            }
        };

        initialize();

        return {
            target: $this,
            nextSlide: nextSlide,
            prevSlide: prevSlide,
            changeSlide: changeSlide,
            settings: settings
        };
    };
    return $;
});