(function($){
	$(document).ready(function() {	

		// Scroll to Top
		jQuery('.scrolltotop').click(function(){
			jQuery('html').animate({'scrollTop' : '0px'}, 400);
			return false;
		});
		
		jQuery(window).scroll(function(){
			var upto = jQuery(window).scrollTop();
			if(upto > 500) {
				jQuery('.scrolltotop').fadeIn();
			} else {
				jQuery('.scrolltotop').fadeOut();
			}
		});

		// accordion
		$('.accordion').accordion({
			collapsible: true,
			
		});
		
		$("#owl-csel1").owlCarousel({
			items: 2,
			autoplay: true,
			autoplayTimeout: 3000,
			startPosition: 0,
			rtl: false,
			loop: true,
			margin: 20,
			dots: true,
			nav: true,
			// center:true,
			// stagePadding: 2,
			navText: [
						'<i class="fa-solid fa-arrow-left-long"></i>',
						'<i class="fa-solid fa-arrow-right-long"></i>'
					],
			navContainer: '.main-content .custom-nav',
			responsive:{
				0: {
					items: 1.2,
					center:true,						
				},
				767: {
					items: 1.9,	
					center:true,						
				},
				1200: {
					items: 2,						
				}
			}

		});	
		
		$("#owl-csel2").owlCarousel({
			items: 3,
			autoplay: true,
			autoplayTimeout: 3000,
			startPosition: 0,
			rtl: false,
			loop: true,
			margin: 10,
			dots: true,
			nav: true,
			// center:true,
			// stagePadding: 2,
			navText: [
						'<i class="fa-solid fa-arrow-left-long"></i>',
						'<i class="fa-solid fa-arrow-right-long"></i>'
					],
			navContainer: '.main-content2 .custom-nav',
			responsive:{
				0: {
					items: 1.3,
					center:true,						
				},
				767: {
					items: 1.9,	
					center:true,							
				},
				1200: {
					items: 3,						
				}
			}

		});
		
	});
})(jQuery);
