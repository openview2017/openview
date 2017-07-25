;(function($) {
	function Steps(options) {
		this.options = $.extend({
			stepBox: '.slide',
			btnPrev: '.prev',
			btnNext: '.next',
			currentClass: 'current-step',
			validateRow: '.validate-row',
			activeClass: 'active',
			errorClass: 'error',
			errorStepClass: 'error-step',
			successClass: 'success',
			requiredClass: 'required',
			requiredEmailClass: 'required-email',
			requiredNumberClass: 'required-number',
			requiredSelectClass: 'required-select',
			requiredCheckboxClass: 'required-checkbox',
			requiredRadioClass: 'required-radio',
			galleryAPI: false
		}, options);
		this.init();
	}
	Steps.prototype = {
		init: function() {
			if (this.options.holder) {
				this.findElements();
				this.attachEvents();
				this.makeCallback('onInit', this);
			}
		},
		findElements: function() {
			this.regEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			this.regPhone = /^[0-9]+$/;
			this.holder = $(this.options.holder);
			this.stepsBoxes = this.holder.find(this.options.stepBox);
			this.btnPrev = this.holder.find(this.options.btnPrev);
			this.btnNext = this.holder.find(this.options.btnNext);
			this.currentStep = 0;

			if (this.options.galleryAPI) {
				this.galleryAPI = this.holder.data(this.options.galleryAPI);
			} else {
				this.stepsBoxes.eq(this.currentStep).addClass(this.options.currentClass);
			}
		},
		attachEvents: function() {
			var self = this;

			if (this.btnPrev.length) {
				this.btnPrev.on('click', function(e) {
					e.preventDefault();
					self.prevStep();
					self.updateStepProgress();
				});
			}

			if (this.btnNext.length) {
				this.btnNext.on('click', function(e) {
					e.preventDefault();
                    if (self.currentStep === 1 && $.inString(location.href, "newapp")){
                        self.nextStep();
                        self.updateStepProgress();
                        /*$fullscreenloader = $("#simulation-notice");
                        $fullscreenloader.fancybox({
				            live: true,
				            padding: 0,
				            loop: false,
				            afterLoad: function(current, previous) {
								var config = $("a[href="+current.href+"]");
								if (current.href.indexOf('#') === 0) {
									jQuery(current.href).find('a.close').off('click.fb').on('click.fb', function(e) {
										e.preventDefault();
										jQuery.fancybox.close();
									});
								}
							}
				        });

				        $fullscreenloader.trigger("click");
				        return;*/
                    } else {
                        self.nextStep();
                        self.updateStepProgress();
                    }
				});
			}
		},
		prevStep: function() {
			this.holder.removeClass(this.options.errorStepClass);
			this.currentStep--;
			if (this.galleryAPI) {
				this.galleryAPI.prevSlide();
			} else {
				this.stepsBoxes.removeClass(this.options.currentClass);
				this.stepsBoxes.eq(this.currentStep).addClass(this.options.currentClass);
			}

			this.makeCallback('onChangeStepPrev', this);
		},
		nextStep: function() {
			var self = this;
			var block = this.stepsBoxes.filter('.' + (this.galleryAPI ? this.options.activeClass : this.options.currentClass));
			var inputs = block.find('input, textarea, select');

			this.validateForm(inputs);
			this.holder.removeClass(this.options.errorStepClass);

			if (this.holder.data('successFlag') === true) {
				this.currentStep++;
				self.makeCallback('onChangeStep', self);
				if (this.galleryAPI) {
					this.galleryAPI.nextSlide();
				} else {
					this.stepsBoxes.removeClass(this.options.currentClass);
					this.stepsBoxes.eq(this.currentStep).addClass(this.options.currentClass);
				}
			} else {
				self.holder.addClass(self.options.errorStepClass);
			}
		},
		updateStepProgress: function() {
			var stepHint = 'STEP ' + parseInt(this.currentStep+1) + ' of 5';
			$("#sidebar .intro .hint").html(stepHint);
		},
		validateForm: function(inputs) {
			var self = this;
			this.holder.data('successFlag', true);

			/*inputs.each(function(i, obj) {
				self.checkField(i, obj);
			});*/
		},
		checkField: function(i, obj) {
			var self = this;
			var currentObject = $(obj);
			var currentParent = currentObject.closest(this.options.validateRow);

			if (!currentParent.length) return;

			// not empty fields
			if (currentObject.hasClass(this.options.requiredClass)) {
				self.setState(currentParent, currentObject, !currentObject.val().length || currentObject.val() === currentObject.prop('defaultValue'));
			}
			// correct email fields
			if (currentObject.hasClass(this.options.requiredEmailClass)) {
				self.setState(currentParent, currentObject, !self.regEmail.test(currentObject.val()));
			}
			// correct number fields
			if (currentObject.hasClass(this.options.requiredNumberClass)) {
				self.setState(currentParent, currentObject, !self.regPhone.test(currentObject.val()));
			}
			// something selected
			if (currentObject.hasClass(this.options.requiredSelectClass)) {
				self.setState(currentParent, currentObject, currentObject.get(0).selectedIndex === 0);
			}
			// checkbox field
			if (currentParent.hasClass(this.options.requiredCheckboxClass)) {
				self.setState(currentParent, currentObject, !currentParent.find(':checkbox:checked').length);
			}
			if (currentObject.hasClass('required-check')) {
				currentParent = currentObject.closest('.checkbox-holder');
				self.setState(currentParent, currentObject, !currentParent.find(':checkbox.required-check:checked').length);
			}
			// radio field
			if (currentParent.hasClass(this.options.requiredRadioClass)) {
				self.setState(currentParent, currentObject, !currentParent.find(':radio:checked').length);
			}
		},
		setState: function(hold, field, error) {
			var self = this;

			hold.removeClass(self.options.errorClass).removeClass(self.options.successClass);
			if (error) {
				hold.addClass(self.options.errorClass);
				field.one('focus', function() {
					hold.removeClass(self.options.errorClass).removeClass(self.options.successClass);
				});
				self.holder.data('successFlag', false);
			} else {
				hold.addClass(self.options.successClass);
			}
		},
		makeCallback: function(name) {
			if (typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		}
	};

	// jQuery plugin interface
	$.fn.steps = function(opt) {
		return this.each(function() {
			jQuery(this).data('Steps', new Steps($.extend(opt, {
				holder: this
			})));
		});
	};
}(jQuery));