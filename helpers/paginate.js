var qs = require('querystring')

module.exports.paginate = function(req, res, next) {
    res.locals({ paginate: function (count, nPerPage, pageNumber, opts) {
        var dots, link, n, n_display, output, page_links, settings = {}, opts = opts || {};
        settings = [];
        settings['base'] = '%_%';
        settings['format'] = '?page=%#%';
        settings['total'] = parseInt(Math.ceil(count / nPerPage));
        settings['current'] = parseInt(pageNumber);
        settings['show_all'] = false;
        settings['prev_next'] = true;
        settings['prev_text'] = '&larr; Previous';
        settings['next_text'] = 'Next &rarr;';
        settings['end_size'] = 3;
        settings['mid_size'] = 3;
        settings['add_args'] = parseAdditionalArgs(opts.add_args || '');
        page_links = new Array();
        dots = false;
        if (settings['prev_text'] && settings['current'] && 1 < settings['current']) {
            link = settings["base"].replace("%_%", settings["format"]);
            link = link.replace("%#%", settings["current"] - 1);
            page_links.push('<li class="prev"><a href="' + link + settings["add_args"] + '">' + settings["prev_text"] + '</a></li>');
        } else {
            page_links.push('<li class="prev disabled"><a href="#">' + settings["prev_text"] + '</a></li>');
        }
        n = 1;
        while (n <= settings["total"]) {
            n_display = n;
            if (n === settings["current"]) {
                page_links.push('<li class="active"><a href="' + link + settings["add_args"] + '">' + n_display + '</a></li>');
                dots = true;
            } else {
                if (settings["show_all"] || (n <= settings["end_size"] || (settings["current"] && n >= settings["current"] - settings["mid_size"] && n <= settings["current"] + settings["mid_size"]) || n > settings["total"] - settings["end_size"])) {
                    link = settings["base"].replace("%_%", settings["format"]);
                    link = link.replace("%#%", n);
                    page_links.push('<li><a href="' + link + settings["add_args"] + '">' + n_display + '</a></li>');
                    dots = true;
                } else if (dots && !settings["show_all"]) {
                    page_links.push('<li class="disabled"><a href="#">...</a></li>');
                    dots = false;
                }
            }
            n++;
        }
        if (settings["prev_next"] && settings["current"] && (settings["current"] < settings["total"] || -1 === settings["total"])) {
            link = settings["base"].replace("%_%", settings["format"]);
            link = link.replace("%#%", parseInt(settings["current"]) + 1);
            page_links.push('<li class="next"><a href="' + link + settings["add_args"] + '">' + settings["next_text"] + '</a></li>');
        } else {
            page_links.push('<li class="next disabled"><a href="#">' + settings["next_text"] + '</a></li>');
        }
        return '<div class="pagination"><ul>' + page_links.join("\n") + '</ul></div>';
    }
    });
    next();
}

function parseAdditionalArgs(args){

    return args==''? args: '&'+qs.encode(args)
}

