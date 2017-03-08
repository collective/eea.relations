/* global jQuery, window, document, _, context_url */

jQuery(function($){
    // 13870 sort relations based on given criteria
    var $relations_parent = $('#relatedItems');
    var $relations = $relations_parent.find('.visualNoMarker > div');
    var $tab_panels = $relations_parent.find(".eea-tabs-panel");
    var $sort_parent = $(".sorter_ctl");
    var $sort_select = $sort_parent.find('select');

    if ($relations.children().length > 10) {
        $sort_parent.show();
    }

    $(window).bind('relations.showSortingWidget', function(){
        if ($tab_panels.length) {
            $tab_panels.each(function(){
                var $this = $(this);
                var data_attr = $this.find('.page').eq(0).data();
                if (data_attr && data_attr.count > 10) {
                    $sort_parent.show();
                    return false;
                }
            });
        }
    });

    $(window).trigger('relations.showSortingWidget');

    $sort_select.change(function(e) {
        var sort_parameter = e.currentTarget.value;
        $relations.each(function(){
            var $this = $(this);
            var $children = $this.children().detach();
            // sort based on the data attributes set on the listing elements
            $children.sort(function(a, b) {
                return $(a).data(sort_parameter) > $(b).data(sort_parameter) ? 1 : -1;
            });
            $this.append($children);
        });
        $(window).trigger('relations.sort', sort_parameter);
    });

    $(window).bind('relations.sort', function(ev, sort_parameter) {
        $tab_panels.each(function(){
            // sort items differently if we have eea-tabs and eea-pagination present
            // this event can be bound by third party code which can supplement different
            // sorting
            var $this = $(this);
            var $listing_entries = $this.find('.photoAlbumEntry, .tileItem').detach();
            $listing_entries.sort(function(a, b) {
                return $(a).data(sort_parameter) > $(b).data(sort_parameter) ? 1 : -1;
            });
            var slice_index = 0;
            $('.page', $this).each(function(i, el){
                var $el = $(el);
                var count = $el.data('count');
                var current_index = slice_index;
                slice_index += count;
                $el.append($listing_entries.slice(current_index, slice_index));
            });
        });
    });

    // 80633 related article
     var pushState = function(url) {
        if (window.history) {
            return window.history.pushState({index: 0}, "", url);
        }
        else {
            return $.bbq.pushState(url);
        }
    };

    (function related_article() {
        var $notifier = $(".eea-notifier");
        if (!$notifier.length) {
            return;
        }

        var content_core = document.getElementById("content-core");
        content_core.classList += 'eea-article';

        // scroll to top when reaching and clicking on go to top link
        var original_document = {url: context_url, title: document.title};
        $('.eea-to-top').click(function(ev) {
            ev.preventDefault();
            $.scrollTo({
                behavior: 'smooth',
                left: 0,
                top: 0
            });
            set_location(original_document);
        });

        $notifier.click(function(ev) {
            ev.preventDefault();
            var target = ev.currentTarget;
            var target_url = target.getAttribute('data-url');
            var $articles = $('.eea-article');
            var $article = $articles.filter('[data-url="' + target_url + '"]');
            var article = $article[0];
            var target_top = article.getBoundingClientRect().top;
            var document_top = document.body.getBoundingClientRect().top;
            var top = target_top - document_top - 100;
            $(target).removeClass('eea-notifier--active');
            $.scrollTo({
                behavior: "smooth",
                left: 0,
                top: top
            });

            set_location({url: article.dataset.url, title: article.dataset.title});
        });

        var url = $notifier.attr('data-url');
        var nextPageUrl = "http://" + window.location.host + url + '?ajax_load=1';
        var $articles = $('.eea-article');
        // add related article through ajax load
        if (!$articles.filter('[data-url="' + url + '"]').length) {
            $.get(nextPageUrl, function(data) {
                var $content_children = $(data).find('#content').children();
                $content_children.filter(function(idx, el) { return el.id !== 'relatedItems'; });
                var $article = $("<article />", {
                    'data-url': url,
                    'data-title': $content_children.find('h1').text(),
                    'class': 'eea-article'
                });
                $content_children.appendTo($article);
                $article.insertBefore('#viewlet-below-content');
                $notifier.addClass("eea-notifier-ready");
            });
        }

        // set window location helper
        function set_location(obj) {
            var current_path = window.location.href;
            var notifier_url = obj.url;
            if (current_path.indexOf(notifier_url) === -1) {
                pushState(notifier_url);
                document.title = obj.title;
                $notifier.removeClass('eea-notifier--active');
            }
        }

        var boundary = 320;
        function check_current_url() {
            var window_height;
            var change_location = function (t) {
                if (t.id === "content-core") {
                    set_location(original_document);
                }
                else {
                    set_location({url: t.dataset.url, title: t.dataset.title});
                }
            };
            var article_in_view = function (t, e) {
                var n = t.getBoundingClientRect();
                return n.bottom > 0 && n.top < e - boundary;
            };
            var check_scrolled_articles = function () {
                window_height = window.innerHeight || document.documentElement.clientHeight;
                var articles = document.querySelectorAll('.eea-article');
                for (var e = articles.length - 1; e >= 0; e--)
                    if (article_in_view(articles[e], window_height)) {
                        change_location(articles[e]);
                        break;
                    }
            };
            check_scrolled_articles();
        }

        // show next article notifier when scrolling over half of the given article
        jQuery(window).scroll(_.debounce(function() {
            if(!$notifier.hasClass('eea-notifier-ready')) {
                return;
            }
            var content_box = content_core.getBoundingClientRect();
            var content_box_bottom = content_box.bottom;
            var window_height = (window.innerHeight || document.documentElement.clientHeight);
            if (content_box_bottom > 0 && (window_height + window.parseInt(content_box.height / 2) > content_box_bottom)) {
                $notifier.addClass('eea-notifier--active');
            }
            else {
                $notifier.removeClass('eea-notifier--active');
            }
            check_current_url();
        }, 300));

    }());
});

