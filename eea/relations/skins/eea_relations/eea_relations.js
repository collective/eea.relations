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
                slice_index = slice_index + count;
                $el.append($listing_entries.slice(current_index, slice_index));
            });
        });
    });

    var $notifier = $(".eea-notifier");
    $notifier.click(function(ev) {
        ev.preventDefault();
        var $socialmedia = $("#socialmedia-viewlet");
        $.scrollTo({
            behavior: "smooth",
            left: 0,
            top: $socialmedia.scrollTop()
        });
    });

    $('#content-core').infiniteScrollHelper({
        loadMore: function(page, done) {
            $notifier.addClass('eea-notifier--active');
            var url = $notifier.attr('data-url');
            var nextPageUrl = "http://" + window.location.host + url + '?ajax_load=1';
            var $articles = $('article');
            if (!$articles.filter('[data-url="' + url + '"]').length) {
                $.get(nextPageUrl, function(data) {
                    var $content_children = $(data).find('#content').children();
                    var $article = $("<article />", {'data-url': url});
                    $content_children.appendTo($article);
                    $article.insertBefore('#viewlet-below-content');
                    // call the done callback to let the plugin know you are done loading
                    done();
                });
            }
        }
    });
    $('.eea-to-top').click(function(ev){
        ev.preventDefault();
        $.scrollTo({
            behavior: 'smooth',
            left: 0,
            top: 0
        });
    });

});
