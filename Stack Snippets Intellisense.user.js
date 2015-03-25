// ==UserScript==
// @name         Stack Snippets Intellisense
// @namespace    http://stackoverflow.com/
// @version      0.1
// @description  Adds Intellisense using the VS Monaco JS libraries to Stack Snippets
// @author       Dean Ward
// @match        http://stackoverflow.com/questions/ask
// @grant        none
// ==/UserScript==

window.require = {
    baseUrl: "http://p.sfx.ms/Monaco/V1.6/"
};

$(function() {
    $(document).on("click", ".wmd-snippet-button", function() {
        window.MonacoEnvironment = window.MonacoEnvironment || {
            getWorkerUrl: function (workerId, label)
            {
                var blob = new Blob([
                    'self.MonacoEnvironment = self.MonacoEnvironment || {};',
                    'self.MonacoEnvironment.baseUrl = "https\x3a\x2f\x2fp.sfx.ms\x2fMonaco\x2fV1.6\x2f";',
                    'self.MonacoEnvironment.label = "' + label + '";',
                    'importScripts("https://p.sfx.ms/Monaco/V1.6/vs/base/worker/workerMain.js");'
                ], {
                    type: 'text/javascript'
                });
                var urlBuilder = window.URL || window.webkitURL;
                var blobUrl = urlBuilder.createObjectURL(blob);
                return blobUrl;
            },
            baseUrl: "http://p.sfx.ms/Monaco/V1.6/"
        };
        
        addStyle("http://p.sfx.ms/Monaco/V1.6/vs/editor/editor.main.css", "vs/editor/editor.main");
        addStyle("http://p.sfx.ms/Monaco/V1.6/vs/editor/css/vs-theme.css");

        $.getScript("http://p.sfx.ms/Monaco/V1.6/vs/loader.js")
        .then(function() {
            $.when(
                $.getScript("http://p.sfx.ms/Monaco/V1.6/vs/editor/editor.main.nls.js"),
                $.getScript("http://p.sfx.ms/Monaco/V1.6/vs/editor/editor.main.js")
            ).done(initialiseEditor);
        });
    });
});

function addStyle(url, name) {
    var link = $('<link rel="stylesheet" type="text/css" />').attr('href', url);
    if (name) {
        link.attr('data-name', name);
    }
    
    $('head').append(link);
}

function initialiseEditor() {
    function updateTextArea() {
        var model = this.newEditor.getModel();
        var version = model.getVersionId();
        if (version !== this.version) {
            this.textArea.text(model.getValue());
            this.version = version;
        }
    }
    
    var js = {
        domNode: $(".snippet-box-bottom.snippet-box-left .snippet-box-container")[0],
        originalEditor: $(".snippet-box-bottom.snippet-box-left .CodeMirror"),
        textArea: $(".snippet-box-bottom.snippet-box-left .snippet-box-edit"),
        newEditor: null,
        mode: null,
        version: null,
        updateTextArea: updateTextArea
    };
    
    var html = {
        domNode: $(".snippet-box-top.snippet-box-left .snippet-box-container")[0],
        originalEditor: $(".snippet-box-top.snippet-box-left .CodeMirror"),
        textArea: $(".snippet-box-top.snippet-box-left .snippet-box-edit"),
        newEditor: null,
        mode: null,
        version: null,
        updateTextArea: updateTextArea
    };
    
    var css = {
        domNode: $(".snippet-box-top.snippet-box-right .snippet-box-container")[0],
        originalEditor: $(".snippet-box-top.snippet-box-right .CodeMirror"),
        textArea: $(".snippet-box-top.snippet-box-right .snippet-box-edit"),
        newEditor: null,
        mode: null,
        version: null,
        updateTextArea: updateTextArea
    };
    
    var IDLE_STATE = 0,
        EDITORS_RENDERED = 1,
        FINISHED = 2,
        state = IDLE_STATE;

    (function() {
        var editorLoaded = false;

        require(['vs/editor/editor.main', 'vs/nls!vs/editor/editor.main', 'vs/css!vs/editor/editor.main'], function () {
            Monaco.Editor.getOrCreateMode('text/javascript').then(function (mode) {
                js.mode = mode;
                onEditorLoaded();
            });
             
            Monaco.Editor.getOrCreateMode('text/css').then(function (mode) {
                css.mode = mode;
                onEditorLoaded();
            });

            Monaco.Editor.getOrCreateMode('text/html').then(function (mode) {
                html.mode = mode;
                onEditorLoaded();
            });
        });

        function onEditorLoaded() {
            if (state === IDLE_STATE) {
                js.newEditor = Monaco.Editor.create(js.domNode, {
                    value: '',
                    mode: 'text/plain',
                    fontIsMonospace: true,
                    suggestOnTriggerCharacters: true
                });
                
                css.newEditor = Monaco.Editor.create(css.domNode, {
                    value: '',
                    mode: 'text/plain',
                    fontIsMonospace: true,
                    suggestOnTriggerCharacters: true
                });
                
                html.newEditor = Monaco.Editor.create(html.domNode, {
                    value: '',
                    mode: 'text/plain',
                    fontIsMonospace: true,
                    suggestOnTriggerCharacters: true
                });
                
                state = EDITORS_RENDERED;
            }
            if (state === EDITORS_RENDERED) {
                if (js.mode) {
                    js.newEditor.getModel().setValue('', js.mode);
                    js.originalEditor.remove();
                }
                
                if (css.mode) {
                    css.newEditor.getModel().setValue('', css.mode);
                    css.originalEditor.remove();
                }
                
                if (html.mode) {
                    html.newEditor.getModel().setValue('', html.mode);
                    html.originalEditor.remove();
                }             
                
                if (js.mode && css.mode && html.mode) {
                    state = FINISHED;
                }
            }
        }

        setInterval(function () {
            if (state < FINISHED) {
                return;
            }

            js.updateTextArea();
            css.updateTextArea();
            html.updateTextArea();
        }, 1000);

    })();
}