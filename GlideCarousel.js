(function($) {
		$.fn.glideCarousel = function(options) {

			// Default options
			var settings = $.extend({
				startAt: 0,
				perView: 1,
				focusAt: 'center',
				gap: 0,
				autoplay: false,
				hoverpause: true,
				keyboard: true,
				swipeThreshold: 80,
				dragThreshold: 120,
				animationDuration: 500,
				animationTimingFunc: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
				breakpoints: null,
				arrows: true,
				arrowsWrapperClass: 'glide__arrows',
				arrowMainClass: 'glide__arrow',
				arrowPrevClass: 'glide__arrow--prev',
				arrowNextClass: 'glide__arrow--next',
				arrowMainMarkup: '<button class="glide__arrow"></button>',
				arrowPrevMarkup: '<span class="glide__arrow--prev" aria-label="previous"></span>',
				arrowNextMarkup: '<span class="glide__arrow--next" aria-label="next"></span>',
				navigation: true,
				navWrapperClass: 'glide__nav',
				navMainClass: 'glide__nav__item',
				navMainMarkup: '<button class="glide__nav__item"></button>',
				navActiveClass: 'glide__nav--active',
				pagination: true,
				paginationMainClass: 'glide__pagination',
				paginationBulletClass: 'glide__pagination__bullet',
				paginationCurrentClass: 'glide__pagination__bullet--current',
				paginationMarkup: '<div class="glide__pagination"></div>',
				lazyLoad: false,
				rewind: true,
				rewindDuration: 800,
				rewindTimingFunc: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
				accessibility: true,
				analytics: null,
				preloader: false,
				background: null,
				captions: null,
				transitions: true,
				sizes: true,
				borders: true,
				filters: true,
				overlays: true,
				throttle: 16,
				debounce: 250
			}, options);

			// GlideCarousel class
			var GlideCarousel = function(element, settings) {
				this.$element = $(element);
				this.settings = settings;
				this.classes = {
					base: 'glide',
					container: 'glide__container',
					track: 'glide__track',
					slide: 'glide__slide',
					clone: 'glide__slide--clone',
					active: 'glide__slide--active',
					disabled: 'glide__arrow--disabled',
					direction: {
						ltr: 'glide--ltr',
						rtl: 'glide--rtl'
					}
				};
				this.data = {
					currentIndex: 0,
					total: this.$element.children().length,
					width: null,
					height: null,
					size: null,
					ratio: null,
					settings: {}
				};
				this.isTransitioning = false;
				this.isDragging = false;
				this.dragOffset = 0;
				this.dragStartX = 0;
				this.dragEndX = 0;
				this.dragStartY = 0;
				this.dragEndY = 0;
				this.eventStart = null;
				this.eventEnd = null;
				this.eventStartX = null;
				this.eventStartY = null
				this.eventEndX = null;
				this.eventEndY = null;
				this.eventMove = null;
				this.ticking = false;
				this.responsiveSettings = null;
				this.currentBreakpoint = null;
				this.arrowsWrapper = null;
				this.arrows = null;
				this.navWrapper = null;
				this.navItems = null;
				this.pagination = null;
				this.slides = [];
				this.slidesInstances = [];
				this.slidesClones = [];
				this.slidesClonesInstances = [];
				this.animation = null;
				this.preloader = null;
				this.background = null;
				this.captions = null;
				this.analytics = null;
				this.init();
			};

			GlideCarousel.prototype = {

				init: function() {
					// Initialize variables and elements
					this.initVars();
					this.initElements();
					// Set up events
					this.bindEvents();
					// Set up preloader
					if (this.settings.preloader) {
						this.initPreloader();
					}
					// Set up background
					if (this.settings.background) {
						this.initBackground();
					}
					// Set up captions
					if (this.settings.captions) {
						this.initCaptions();
					}
					// Set up analytics
					if (this.settings.analytics) {
						this.initAnalytics();
					}
					// Set up transitions
					if (this.settings.transitions) {
						this.initTransitions();
					}
					// Set up sizes
					if (this.settings.sizes) {
						this.initSizes();
					}
					// Set up borders
					if (this.settings.borders) {
						this.initBorders();
					}
					// Set up filters
					if (this.settings.filters) {
						this.initFilters();
					}
					// Set up overlays
					if (this.settings.overlays) {
						this.initOverlays();
					}
					// Set up lazy loading
					if (this.settings.lazyLoad) {
						this.initLazyLoad();
					}
					// Set up rewind
					if (this.settings.rewind) {
						this.initRewind();
					}
					// Set up accessibility
					if (this.settings.accessibility) {
						this.initAccessibility();
					}
					// Set up throttle and debounce
					this.initThrottleDebounce();
					// Trigger events
					this.triggerEvent('mount.after');
				},

				initVars: function() {
					// Set settings data
					this.data.settings = this.settings;
					// Set glide direction class
					this.$element.toggleClass(this.classes.direction.ltr, this.settings.direction === 'ltr');
					this.$element.toggleClass(this.classes.direction.rtl, this.settings.direction === 'rtl');
					// Set glide sizes
					this.data.width = this.$element.width();
					this.data.height = this.$element.height();
					this.data.size = this.data.width;
					this.data.ratio = this.data.width / this.data.height;
					// Set breakpoints
					if (this.settings.breakpoints) {
						this.responsiveSettings = this.settings.breakpoints;
					}
					// Set current breakpoint
					this.currentBreakpoint = this.getCurrentBreakpoint();
					// Set slide sizes
					this.slides = this.$element.children().toArray();
					this.slidesInstances = this.slides.map(function(slide, index) {
						return new GlideSlide(slide, index, this);
					}.bind(this));
					// Set slide clones
					this.slidesClones = this.slidesInstances.map(function(slide) {
						return slide.clone();
					});
					this.slidesClonesInstances = this.slidesClones.map(function(slide, index) {
						return new GlideSlide(slide, index, this);
					}.bind(this));
				},

				initElements: function() {
					// Create wrapper
					this.wrapper = $('<div/>', {
						class: this.classes.wrapper,
						'aria-live': 'polite',
						'aria-atomic': 'true',
						'aria-relevant': 'additions',
						'aria-label': this.settings.ariaLabel
					});

					// Create track
					this.track = $('<div/>', {
						class: this.classes.track
					});

					// Create slides wrapper
					this.slidesWrapper = $('<div/>', {
						class: this.classes.slidesWrapper
					});

					// Append slides
					this.slides.forEach(function(slide) {
						$(slide).appendTo(this.slidesWrapper);
					}.bind(this));

					// Append slides clones
					this.slidesClones.forEach(function(clone) {
						$(clone).appendTo(this.slidesWrapper);
					}.bind(this));

					// Append track to wrapper
					this.track.appendTo(this.wrapper);

					// Append slides wrapper to track
					this.slidesWrapper.appendTo(this.track);

					// Append wrapper to element
					this.wrapper.appendTo(this.$element);

					// Set dimensions
					this.slidesWrapper.width(this.data.width * (this.slides.length + this.slidesClones.length) + 'px');

					this.slidesInstances.concat(this.slidesClonesInstances).forEach(function(slide) {
						slide.$element.width(this.data.width + 'px');
					}.bind(this));

					// Set initial position
					this.translateTo(0);
				},

				bindEvents: function() {
					// Resize event
					$(window).on('resize', this.throttle(this.onResize.bind(this), 50));
					// Touch events
					this.$element.on('touchstart.glideCarousel', this.onTouchStart.bind(this));
					this.$element.on('touchmove.glideCarousel', this.onTouchMove.bind(this));
					this.$element.on('touchend.glideCarousel', this.onTouchEnd.bind(this));
					// Mouse events
					this.$element.on('mousedown.glideCarousel', this.onTouchStart.bind(this));
					$(document).on('mousemove.glideCarousel', this.onTouchMove.bind(this));
					$(document).on('mouseup.glideCarousel', this.onTouchEnd.bind(this));
					// Click events
					this.$element.on('click.glideCarousel', '.' + this.classes.arrow, this.onClickArrow.bind(this));
					this.$element.on('click.glideCarousel', '.' + this.classes.navItem, this.onClickNavItem.bind(this));
					this.$element.on('click.glideCarousel', '.' + this.classes.paginationItem, this.onClickPaginationItem.bind(this));
					// Keyboard events
					$(document).on('keydown.glideCarousel', this.onKeyDown.bind(this));
					// Drag events
					this.$element.on('dragstart.glideCarousel', this.onDragStart.bind(this));
					this.$element.on('dragend.glideCarousel', this.onDragEnd.bind(this));
					// Visibility events
					document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
					// Unload events
					$(window).on('unload', this.onUnload.bind(this));
				},

				initPreloader: function() {
					// Create preloader
					this.preloader = $('<div/>', {
						class: this.classes.preloader
					});
					// Append preloader to wrapper
					this.preloader.appendTo(this.wrapper);
					// Preload images
					var images = [];
					this.slidesInstances.forEach(function(slide) {
						var $image = slide.$element.find('img');
						if ($image.length) {
							images.push($image.attr('src'));
						}
					});
					if (images.length) {
						this.triggerEvent('preload.before');
						imagesLoaded(images, function() {
							this.triggerEvent('preload.after');
							this.preloader.remove();
						}.bind(this));
					} else {
						this.preloader.remove();
					}
				},


				initArrows: function() {
					if (!this.settings.arrows) {
						return;
					}
					// Create arrows
					this.arrowPrev = $('<button/>', {
						type: 'button',
						class: this.classes.arrow + ' ' + this.classes.arrowPrev,
						'aria-label': this.settings.arrowLabelPrev
					}).append($('<i/>', {
						class: this.classes.arrowIcon + ' ' + this.classes.arrowIconPrev
					}));
					this.arrowNext = $('<button/>', {
						type: 'button',
						class: this.classes.arrow + ' ' + this.classes.arrowNext,
						'aria-label': this.settings.arrowLabelNext
					}).append($('<i/>', {
						class: this.classes.arrowIcon + ' ' + this.classes.arrowIconNext
					}));
					// Append arrows to wrapper
					this.arrowPrev.appendTo(this.wrapper);
					this.arrowNext.appendTo(this.wrapper);
				},

				initNav: function() {
					if (!this.settings.nav) {
						return;
					}
					// Create nav
					this.nav = $('<div/>', {
						class: this.classes.nav
					});
					// Append nav to wrapper
					this.nav.appendTo(this.wrapper);
					// Append nav items
					this.slidesInstances.forEach(function(slide, index) {
						var navItem = $('<button/>', {
							type: 'button',
							class: this.classes.navItem,
							'aria-label': this.settings.navLabel.replace(/\{index\}/g, index + 1)
						}).append($('<span/>', {
							class: this.classes.navItemLabel,
							text: index + 1
						}));
						navItem.appendTo(this.nav);
					}.bind(this));
					// Set active nav item
					this.setActiveNavItem(this.currentSlideIndex);
				},

				initPagination: function() {
					if (!this.settings.pagination) {
						return;
					}
					// Create pagination
					this.pagination = $('<div/>', {
						class: this.classes.pagination
					});
					// Append pagination to wrapper
					this.pagination.appendTo(this.wrapper);
					// Append pagination items
					for (var i = 0; i < this.slides.length; i++) {
						var paginationItem = $('<button/>', {
							type: 'button',
							class: this.classes.paginationItem,
							'aria-label': this.settings.paginationLabel.replace(/\{index\}/g, i + 1)
						});
						paginationItem.appendTo(this.pagination);
					}
					// Set active pagination item
					this.setActivePaginationItem(this.currentSlideIndex);
				},

				setActiveNavItem: function(index) {
					if (!this.nav) {
						return;
					}
					this.nav.find('.' + this.classes.navItem).removeClass(this.classes.navItemActive);
					this.nav.find('.' + this.classes.navItem + ':eq(' + index + ')').addClass(this.classes.navItemActive);
				},

				setActivePaginationItem: function(index) {
					if (!this.pagination) {
						return;
					}
					this.pagination.find('.' + this.classes.paginationItem).removeClass(this.classes.paginationItemActive);
					this.pagination.find('.' + this.classes.paginationItem + ':eq(' + index + ')').addClass(this.classes.paginationItemActive);
				},

				throttle: function(callback, limit) {
					var wait = false;
					return function() {
						if (!wait) {
							callback.call();
							wait = true;
							setTimeout(function() {
								wait = false;
							}, limit);
						}
					};
				},

				onResize: function() {
					this.triggerEvent('resize.before');
					this.slidesInstances.concat(this.slidesClonesInstances).forEach(function(slide) {
						slide.width(this.data.width + 'px');
					}.bind(this));
					// Update dimensions
					this.data.width = this.element.width();
					this.slidesInstances.concat(this.slidesClonesInstances).forEach(function(slide) {
						slide.width(this.data.width + 'px');
					}.bind(this));
					this.slidesWrapper.width(this.data.width * (this.slides.length + this.slidesClones.length) + 'px');
					// Update position
					this.goToSlide(this.currentSlideIndex, false);
					this.triggerEvent('resize.after');
				},

				onTransitionEnd: function() {
					this.isAnimating = false;
					this.slidesInstances.concat(this.slidesClonesInstances).forEach(function(slide) {
						slide.css({
							transition: '',
							transform: ''
						});
					});
					// Trigger event
					this.triggerEvent('transition.end');
				},

				onDragStart: function(event) {
					if (this.isAnimating) {
						return;
					}
					// Prevent dragging on non-primary button
					if (event.type === 'mousedown' && event.button !== 0) {
						return;
					}
					// Prevent dragging if touch action is none
					if (event.type === 'touchstart' && event.target.style.touchAction === 'none') {
						return;
					}
					// Prevent dragging if swipe threshold is not met
					if (this.settings.swipeThreshold > 0 && Math.abs(this.drag.endX - this.drag.startX) < this.settings.swipeThreshold) {
						return;
					}
					// Stop autoplay
					this.stopAutoplay();
					// Set dragging flag
					this.isDragging = true;
					// Add grabbing cursor
					this.wrapper.addClass(this.classes.wrapperGrabbing);
					// Save start position
					this.drag.startX = this.getEventPosition(event).x;
					this.drag.startY = this.getEventPosition(event).y;
					// Set transition duration to 0 for all slides
					this.slidesInstances.concat(this.slidesClonesInstances).forEach(function(slide) {
						slide.css({
							transitionDuration: '0ms'
						});
					});
					// Trigger event
					this.triggerEvent('drag.start');
				},

				onDragMove: function(event) {
					if (!this.isDragging) {
						return;
					}
					// Save end position
					this.drag.endX = this.getEventPosition(event).x;
					this.drag.endY = this.getEventPosition(event).y;
					// Calculate distance and percentage
					this.drag.distance = this.drag.endX - this.drag.startX;
					this.drag.distancePercentage = this.drag.distance / this.data.width * 100;
					// Calculate drag direction
					if (this.drag.distance > 0) {
						this.drag.direction = 'right';
					} else if (this.drag.distance < 0) {
						this.drag.direction = 'left';
					} else {
						this.drag.direction = '';
					}
					// Prevent scrolling if dragging horizontally
					if (Math.abs(this.drag.distance) > Math.abs(this.drag.endY - this.drag.startY)) {
						event.preventDefault();
					}
					// Calculate and apply drag distance to all slides
					this.slidesInstances.forEach(function(slide, index) {
						var translateX = index * 100 + this.drag.distancePercentage;
						slide.css('transform', 'translateX(' + translateX + '%)');
					}.bind(this));
					// Trigger event
					this.triggerEvent('drag.move');
				},

				onDragEnd: function() {
					if (!this.isDragging) {
						return;
					}
					// Remove grabbing cursor
					this.wrapper.removeClass(this.classes.wrapperGrabbing);
					// Calculate current slide index
					if (this.drag.direction === 'left') {
						this.currentSlideIndex++;
					} else if (this.drag.direction === 'right') {
						this.currentSlideIndex--;
					}
					// Fix current slide index if out of bounds
					this.fixCurrentSlideIndex();
					// Go to current slide
					this.goTo(this.currentSlideIndex);
					// Reset dragging flag and drag data
					this.isDragging = false;
					this.drag = {
						startX: 0,
						endX: 0,
						startY: 0,
						endY: 0,
						distance: 0,
						distancePercentage: 0,
						direction: ''
					};
					// Trigger event
					this.triggerEvent('drag.end');
				},

				onResize: function() {
					// Recalculate and apply dimensions to all slides
					this.calculateDimensions();
					this.applySlideDimensions();
					// Go to current slide
					this.goTo(this.currentSlideIndex);
				},

				onKeyUp: function(event) {
					// Ignore if form element is focused
					if (event.target.nodeName === 'INPUT' || event.target.nodeName === 'TEXTAREA') {
						return;
					}
					// Ignore if swipe threshold is not met
					if (this.settings.swipeThreshold > 0 && Math.abs(this.drag.endX - this.drag.startX) < this.settings.swipeThreshold) {
						return;
					}
					// Left arrow key
					if (event.keyCode === 37) {
						this.prev();
					}
					// Right arrow key
					if (event.keyCode === 39) {
						this.next();
					}
				},

				onVisibilityChange: function() {
					// Pause autoplay if page is hidden
					if (document.hidden) {
						this.pauseAutoplay();
					} else {
						this.startAutoplay();
					}
				},

				// ========================
				// Helpers
				// ========================

				calculateDimensions: function() {
					// Calculate wrapper dimensions
					this.data.width = this.wrapper.width();
					this.data.height = this.wrapper.height();
					// Calculate slide dimensions
					this.data.slideWidth = this.data.width / this.settings.slidesToShow;
					this.data.slideHeight = this.data.height / this.settings.slidesToShow;
					// Calculate total slides count
					this.data.slidesCount = this.slides.length;
				},

				applySlideDimensions: function() {
					// Apply dimensions to all slides
					this.slidesInstances.forEach(function(slide, index) {
						var width = this.data.slideWidth - this.settings.slideMargin;
						var height = this.settings.autoHeight ? slide.children().outerHeight(true) : this.data.slideHeight;
						slide.css({
							width: width + 'px',
							height: height + 'px',
							marginLeft: this.settings.slideMargin / 2 + 'px',
							marginRight: this.settings.slideMargin / 2 + 'px'
						});
						slide.children().css('height', '100%');
					}.bind(this));
				},

				createClones: function() {
					var clonesCount = this.settings.loop ? this.settings.slidesToShow * 2 : 0;
					// Remove old clones
					this.slidesClonesInstances.forEach(function(slide) {
						slide.remove();
					});
					this.slidesClonesInstances = [];
					// Clone slides
					for (var i = 0; i < clonesCount; i++) {
						var cloneIndex = i % this.data.slidesCount;
						var clone = this.slides.eq(cloneIndex).clone().addClass(this.classes.slideClone);
						this.wrapper.append(clone);
						this.slidesClonesInstances.push(clone);
					}
				},

				fixCurrentSlideIndex: function() {
					// Fix current slide index if out of bounds
					if (this.currentSlideIndex < 0) {
						this.currentSlideIndex = this.data.slidesCount - this.settings.slidesToShow;
					} else if (this.currentSlideIndex > this.data.slidesCount - this.settings.slidesToShow) {
						this.currentSlideIndex = 0;
					}
				},

				getEventPosition: function(event) {
					var position = {};

					if (event.type.indexOf('mouse') !== -1) {
						position.x = event.pageX;
						position.y = event.pageY;
					} else if (event.type.indexOf('touch') !== -1) {
						var touch = event.originalEvent.touches[0];
						position.x = touch.pageX;
						position.y = touch.pageY;
					}

					return position;
				},

				getSlidePosition: function(slideIndex) {
					// Calculate position of given slide
					var position = {};
					position.x = slideIndex * this.data.slideWidth * -1;
					return position;
				},

				setWrapperPosition: function() {
					// Set position of the wrapper element
					var position = this.getSlidePosition(this.currentSlideIndex);
					this.wrapper.css({
						transform: 'translate3d(' + position.x + 'px, 0, 0)',
						transition: 'transform ' + this.settings.duration + 'ms ' + this.settings.easing
					});
				},

				triggerEvent: function(eventName) {
					// Trigger custom event
					var event = new Event(eventName + '.' + this.uniqueId);
					this.element[0].dispatchEvent(event);
				},

				// ========================
				// Public methods
				// ========================

				init: function() {
					// Generate unique ID for the instance
					this.uniqueId = 'glide_' + Math.floor(Math.random() * 1000);
					// Initialize variables
					this.wrapper = this.element.find('.' + this.classes.wrapper);
					this.slides = this.wrapper.find('.' + this.classes.slide);
					this.slidesInstances = [];
					this.slidesClonesInstances = [];
					this.currentSlideIndex = this.settings.startAt;
					this.drag = {
						startX: 0,
						endX: 0,
						startY: 0,
						endY: 0,
						offsetX: 0,
						distance: 0,
						distancePercentage: 0,
						direction: ''
					};
					// Initialize slides
					this.slides.each(function(index, slide) {
						var instance = new GlideSlide($(slide));
						this.slidesInstances.push(instance);
					}.bind(this));
					// Initialize dimensions
					this.calculateDimensions();
					this.applySlideDimensions();
					// Create clones
					this.createClones();
					// Set wrapper position
					this.setWrapperPosition();
					// Bind events
					$(window).on('resize.' + this.uniqueId, this.onResize.bind(this));
					$(document).on('keyup.' + this.uniqueId, this.onKeyUp.bind(this));
					$(document).on('visibilitychange.' + this.uniqueId, this.onVisibilityChange.bind(this));
					this.element.on('mousedown.' + this.uniqueId, this.onDragStart.bind(this));
					this.element.on('touchstart.' + this.uniqueId, this.onDragStart.bind(this));
					this.element.on('mousemove.' + this.uniqueId, this.onDragMove.bind(this));
					this.element.on('touchmove.' + this.uniqueId, this.onDragMove.bind(this));
					this.element.on('mouseup.' + this.uniqueId, this.onDragEnd.bind(this));
					this.element.on('touchend.' + this.uniqueId, this.onDragEnd.bind(this));
					// Trigger event
					this.triggerEvent('init');
				},

				destroy: function() {
					// Remove clones
					this.slidesClonesInstances.forEach(function(slide) {
						slide.remove();
					});

					// Remove event listeners
					$(window).off('resize.' + this.uniqueId);
					$(document).off('keyup.' + this.uniqueId);
					$(document).off('visibilitychange.' + this.uniqueId);
					this.element.off('mousedown.' + this.uniqueId);
					this.element.off('touchstart.' + this.uniqueId);
					this.element.off('mousemove.' + this.uniqueId);
					this.element.off('touchmove.' + this.uniqueId);
					this.element.off('mouseup.' + this.uniqueId);
					this.element.off('touchend.' + this.uniqueId);

					// Reset variables
					this.currentSlideIndex = 0;
					this.slidesInstances = [];
					this.slidesClonesInstances = [];
					this.containerWidth = 0;
					this.containerHeight = 0;
					this.containerOffset = 0;
					this.containerMargin = 0;
					this.containerPadding = 0;
					this.containerBorder = 0;
					this.containerOverflow = '';
					this.containerOverflowX = '';
					this.containerOverflowY = '';
					this.mouse = {
						dragStartX: 0,
						dragStartY: 0,
						dragEndX: 0,
						dragEndY: 0,
						isDragging: false,
						isSwiping: false
					};

					// Remove data
					this.element.removeData('glide');
				},


				prev: function() {
					// Go to previous slide
					this.goToSlide(this.currentSlideIndex - 1);
				},

				next: function() {
					// Go to next slide
					this.goToSlide(this.currentSlideIndex + 1);
				},

				jump: function(slideIndex) {
					// Go to given slide
					this.goToSlide(slideIndex);
				}

			};

			// ========================
			// Slide class
			// ========================

			function GlideSlide(element) {

				// ========================
				// Public properties
				// ========================

				this.element = element;

				// ========================
				// Public methods
				// ========================

				this.remove = function() {
					// Remove slide element from DOM
					this.element.remove();
				};

			}

			// ========================
			// Plugin definition
			// ========================

			$.fn.glide = function(options) {
				return this.each(function() {
					if (!$.data(this, 'glide')) {
						$.data(this, 'glide', new Glide($(this), options));
					}
				});
			};
		})(jQuery, window, document);
