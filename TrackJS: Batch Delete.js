function getQuery() {
    let storedQuery = localStorage.getItem("TrackJS:BatchDeleteQuery") || "";
    let query = window.prompt("Enter your search query", storedQuery);
    if (query) {
        localStorage.setItem("TrackJS:BatchDeleteQuery", query);
    }

    return query;
}
function fetchErrorIds(page) {
    page = page || 1;
    var errorIds = [];
    return new Promise(function(resolve) {
        console.log("Fetching page %d", page);    
        $.get("https://my.trackjs.com/search?query=" + query + "&page=" + page)
            .then(function(response) {
                let html = $.parseHTML(response);
                let $html = $(html);
                let $messages = $(".searchMessage", $html);

                $messages.each(function() {
                    errorIds.push($(this).attr("href").replace(/\/details\//, ""));
                });

                if ($messages.length == 0) {
                    resolve(errorIds);
                }
                else {
                    fetchErrorIds(page + 1).then(function(ids) {
                        errorIds = errorIds.concat(ids);
                        resolve(errorIds);
                    });
                }
            });
    });
}

function deleteError(id) {
    return $.ajax({
       url: "https://my.trackjs.com/details/delete/" + id,
       type: "DELETE"
    })
    .then(function(response) {
        return id;
    });
}

var query = getQuery();
if (query) {
    fetchErrorIds().then(function(errorIds) {
        for (var i = 0 ; i < errorIds.length ; i++) {
            deleteError(errorIds[i]).then(function(id) {
                console.log("Deleted error %s", id);
            })
        }
    });
}
