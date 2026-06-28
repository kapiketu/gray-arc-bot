
export function renderPremiumWebsite(site: SiteConfig): string {
    const images = getCategoryImages(site.category);
    return `
<!DOCTYPE html><html><head lang="en">
    <meta charset="UTF-8">

    <!--Page Title-->
    <title>${site.businessName} - Premium Website</title>

    <!--Meta Keywords and Description-->
    <meta name="keywords" content="">
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">

    <!--Favicon-->
    <link rel="shortcut icon" href="http://www.shapingrain.com/downloads/demos/namari/images/favicon.ico" title="Favicon">

    <!-- Main CSS Files -->
    <link rel="stylesheet" href="http://www.shapingrain.com/downloads/demos/namari/css/style.css">

    <!-- Namari Color CSS -->
    <link rel="stylesheet" href="http://www.shapingrain.com/downloads/demos/namari/css/namari-color.css">

    <!--Icon Fonts - Font Awesome Icons-->
    <link rel="stylesheet" href="http://www.shapingrain.com/downloads/demos/namari/css/font-awesome.min.css">

    <!-- Animate CSS-->
    <link href="http://www.shapingrain.com/downloads/demos/namari/css/animate.css" rel="stylesheet" type="text/css">

    <!--Google Webfonts-->
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700,800" rel="stylesheet" type="text/css">
</head>
<body>

<!-- Preloader -->
<div id="preloader">
    <div id="status" class="la-ball-triangle-path">
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>
<!--End of Preloader-->

<div class="page-border" data-wow-duration="0.7s" data-wow-delay="0.2s">
    <div class="top-border wow fadeInDown animated" style="visibility: visible; animation-name: fadeInDown;"></div>
    <div class="right-border wow fadeInRight animated" style="visibility: visible; animation-name: fadeInRight;"></div>
    <div class="bottom-border wow fadeInUp animated" style="visibility: visible; animation-name: fadeInUp;"></div>
    <div class="left-border wow fadeInLeft animated" style="visibility: visible; animation-name: fadeInLeft;"></div>
</div>

<div id="wrapper">

    <header id="banner" class="scrollto clearfix" data-enllax-ratio=".5">
        <div id="header" class="nav-collapse">
            <div class="row clearfix">
                <div class="col-1">

                    <!--Logo-->
                    <div id="logo">

                        <!--Logo that is shown on the banner-->
                        <h1 style="color:white; font-size: 24px; font-weight: bold; margin: 0;">${site.businessName}</h1>
                        <!--End of Banner Logo-->

                        <!--The Logo that is shown on the sticky Navigation Bar-->
                        <h1 style="color:#333; font-size: 24px; font-weight: bold; margin: 0;">${site.businessName}</h1>
                        <!--End of Navigation Logo-->

                    </div>
                    <!--End of Logo-->

                    <aside>

                        <!--Social Icons in Header-->
                        
                        <!--End of Social Icons in Header-->

                    </aside>

                    <!--Main Navigation-->
                    <nav id="nav-main">
                        <ul>
                            <li>
                                <a href="#banner">Home</a>
                            </li>
                            <li>
                                <a href="#about">About</a>
                            </li>
                            <li>
                                <a href="#gallery">Gallery</a>
                            </li>
                            <li>
                                <a href="#services">Services</a>
                            </li>
                            <li>
                                <a href="#testimonials">Testimonials</a>
                            </li>
                            <li>
                                <a href="#clients">Clients</a>
                            </li>
                            <li>
                                <a href="#pricing">Pricing</a>
                            </li>
                        </ul>
                    </nav>
                    <!--End of Main Navigation-->

                    <div id="nav-trigger"><span></span></div>
                    <nav id="nav-mobile"></nav>

                </div>
            </div>
        </div><!--End of Header-->

        <!--Banner Content-->
        <div id="banner-content" class="row clearfix">

            <div class="col-38">

                <div class="section-heading">${site.heroTitle || site.businessName}</div>

                <!--Call to Action-->
                <a href="https://wa.me/${site.phoneNumber}" class="button">Contact Us on WhatsApp</a>
                <!--End Call to Action-->

            </div>

        </div><!--End of Row-->
    </header>

    <!--Main Content Area-->
    <main id="content">

        <!--Introduction-->
        <section id="about" class="introduction scrollto">

            <div class="row clearfix">

                <div class="col-3">
                    <div class="section-heading">${site.storyTitle || "Our Story"}</div>

                </div>

                <div class="col-2-3">
    <h2 class="section-heading" data-wow-delay="0.1s">${site.storyTitle || "Our Story"}</h2>
    <p>${site.storyContent || site.aboutText}</p>
    <a href="https://wa.me/${site.phoneNumber}" class="button" data-wow-delay="0.2s">Get in touch</a>
</div>

            </div>


        </section>
<section id="services" class="scrollto clearfix">
    <div class="row clearfix">
        <div class="col-3">
            <div class="section-heading">
                <h3>SERVICES</h3>
                <h2 class="section-title">What We Offer</h2>
            </div>
        </div>
        <div class="col-2-3">
            ${site.services.map((item, i) =&gt; \`
            <div class="col-2 icon-block icon-top wow fadeInUp" data-wow-delay="${0.1 * i}s">
                <div class="icon-block-description">
                    <img src="${images.products[i % images.products.length]}" style="width: 100%; border-radius: 4px; margin-bottom: 15px;">
                    <h4>${item.name}</h4>
                    <p style="color: #3b82f6; font-weight: bold; margin-top: 5px;">${item.price}</p>
                    <p>${item.description}</p>
                    <a href="https://wa.me/${site.phoneNumber}?text=${encodeURIComponent('Hi! I am interested in ' + item.name)}" class="button" style="margin-top: 15px; padding: 8px 15px;">Order Now</a>
                </div>
            </div>
            \`).join('')}
        </div>
    </div>
</section>

        <!--End of Introduction-->


        <!--Gallery-->
        
        <!--End of Gallery-->


        <!--Content Section-->
        <div id="services" class="scrollto clearfix">

            <div class="row no-padding-bottom clearfix">


                <!--Content Left Side-->
                <div class="col-3">
                    <!--User Testimonial-->
                    <blockquote class="testimonial text-right bigtest">
                        <q>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                            labore
                            et dolore magna aliqua</q>
                        <footer>— John Doe, Happy Customer</footer>
                    </blockquote>
                    <!-- End of Testimonial-->

                </div>
                <!--End Content Left Side-->

                <!--Content of the Right Side-->
                <div class="col-3">
                    <div class="section-heading">
                        <h3>BELIEVING</h3>
                        <h2 class="section-title">Focusing On What Matters Most</h2>
                        <p class="section-subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam!</p>
                    </div>
                    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                        totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
                        dicta sunt explicabo.
                    </p>
                    <p>
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
                        consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet!
                    </p>
                    <!-- Just replace the Video ID "UYJ5IjBRlW8" with the ID of your video on YouTube (Found within the URL) -->
                    <a href="#" data-videoid="UYJ5IjBRlW8" data-videosite="youtube" class="button video link-lightbox">
                        WATCH VIDEO <i class="fa fa-play" aria-hidden="true"></i>
                    </a>
                </div>
                <!--End Content Right Side-->

                <div class="col-3">
                    <img src="http://www.shapingrain.com/downloads/demos/namari/images/dancer.jpg" alt="Dancer">
                </div>

            </div>


        </div>
        <!--End of Content Section-->

        <!--Testimonials-->
        
        <!--End of Testimonials-->

        <!--Clients-->
        
        <!--End of Clients-->

        <!--Pricing Tables-->
        
        <!--End of Pricing Tables-->

    </main>
    <!--End Main Content Area-->


    <!--Footer-->
    <footer id="landing-footer" class="clearfix">
    <div class="row clearfix text-center">
        <h2 style="color: white; margin-bottom: 20px;">Get In Touch</h2>
        <p style="color: #ccc; margin-bottom: 30px;">Ready to start? Send us a message directly on WhatsApp.</p>
        <a href="https://wa.me/${site.phoneNumber}" class="button">Chat with us</a>
        <p style="margin-top: 50px; font-size: 12px; color: #666;">Powered by The Gray Arc</p>
    </div>
</footer>
    <!--End of Footer-->

</div>

<!-- Include JavaScript resources -->
<script src="http://www.shapingrain.com/downloads/demos/namari/js/jquery.1.8.3.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/wow.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/featherlight.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/featherlight.gallery.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/jquery.enllax.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/jquery.scrollUp.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/jquery.easing.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/jquery.stickyNavbar.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/jquery.waypoints.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/images-loaded.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/lightbox.min.js"></script>
<script src="http://www.shapingrain.com/downloads/demos/namari/js/site.js"></script>


<script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'a12d367798259c5d',t:'MTc4MjY1NTE3NA=='};var a=document.createElement('script');a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script>
</body></html>
    `;
}
