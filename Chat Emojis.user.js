// ==UserScript==
// @name         Chat Emojis
// @namespace    http://stackoverflow.com/
// @version      0.1
// @description  Makes the size of emojis larger in chat
// @author       Dean Ward
// @match        http://chat.meta.stackexchange.com/*
// @grant        none
// ==/UserScript==

$(function() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var target = document.querySelector('#chat');
    console.log(target != null);

    var observer = new MutationObserver(function(mutations) {
        for(var i = 0; i < mutations.length; i++) {
            var mutation = mutations[i];
            for(var j = 0; j < mutation.addedNodes.length; j++) {
                resizeEmojis(mutation.addedNodes[j]);
            }
        }
    });

    observer.observe(target, { childList: true });
});

function resizeEmojis(el) {
    el.innerHTML = el.innerHTML.replace(/\ud83d[\ude00-\ude4f]/g, '<span style="font-size:2em">$&</span>');
}
