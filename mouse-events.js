/*jshint moz:true*/
// based on hints-mouse-events.js 
// https://g.mozest.com/viewthread.php?tid=38908&amp;page=3#pid261071
// and Visual Event (VE)
// https://github.com/DataTables/VisualEvent

var INFO =
[
    "plugin", 
    { 
        name: "mouse-events", version: "0.1",
        href: "http://github.com/amacfie/penta-mouse-events",
        summary: "Add hints to trigger mouse events",
        xmlns: "dactyl" 
    },
    ["author", { email: "amacfie@sent.com" }, "Andrew MacFie"],
    ["license", { href: "http://opensource.org/licenses/mit-license.php" }, "MIT"],
    ["project", { name: "Pentadactyl", "min-version": "1.0" }],
    [
        "p", {},
        "This plugin adds extended hint modes for triggering mouse events.",
        ["item", {},
            ["spec", {}, ";h"],
            ["description", {}, "Simulate mouse hover on hint"]
        ],
        ["item", {},
            ["spec", {}, ";r"],
            ["description", {}, "Trigger left click event at hint with listener"]
        ],
        ["item", {},
            ["spec", {}, ";j"],
            ["description", {}, "Stop simulating mouse hover on hint"]
        ],

    ]
];

(function () {
    var getFilter = function (eventTypes) {
        //Assuming this doesn't have to detect hidden elements
        //(VE line 579)
        return function (elem) {
            // JFT
            //if (elem.className == 'comment-up comment-up-off') {
            //    return true;
            //} else {
            //    return false;
            //}
            // /JFT
            var els = Cc['@mozilla.org/eventlistenerservice;1'].
                getService(Ci.nsIEventListenerService);
            var infos = els.getListenerInfoFor(elem, {});
            for (var i = 0; i < infos.length; i++) {
                if (eventTypes.indexOf(infos[i].type) >= 0) {
                    return true;
                }
            }
            return false;
        };
    };

    var dispatchEvents = function (elem, eventTypes) {
        eventTypes.forEach(function (eventType) {
            var rect = elem.getBoundingClientRect();
            var evt = content.window.document.createEvent('MouseEvents');
            //VE line 879 where originalEvt is mouseover EO
            evt.initEvent(
                eventType,      //type
                true,           //canBubble
                true,           //cancelable
                content.window, //view
                0,              //detail
                rect.left,      //screenX
                rect.top,       //screenY
                rect.left,      //clientX
                rect.top,       //clientY
                false,          //ctrlKey
                false,          //altKey
                false,          //shiftKey
                false,          //metaKey
                0,              //button
                null            //relatedTarget
            );
            //dispatchEvent sets the target to elem
            elem.dispatchEvent(evt);
        });
    };

    var lastMouseOverElem = null;

    dactyl.modules.hints.addMode(
        'h',
        'Simulate mouse hover on hint',
        function (elem) {
            if (lastMouseOverElem) {
                dispatchEvents(lastMouseOverElem, ['mouseout']);
            }
            dispatchEvents(elem, ['mouseover', 'mousemove']);
            lastMouseOverElem = elem;
        },
        getFilter(['mouseover', 'mousemove']),
        ['*']
    );

    dactyl.modules.hints.addMode(
        'r', 
        'Stop simulating mouse hover on hint',
        function (elem) {
            dispatchEvents(elem, ['mouseout']); 
        },
        getFilter(['mouseout']),
        ['*']
    );

    dactyl.modules.hints.addMode(
        'j',
        'Trigger left click event at hint with listener',
        function (elem) {
            dispatchEvents(elem, ['click']);
        },
        getFilter(['click']),
        //don't filter the elements with 'extendedhinttags' first:
        ['*']
    );

    group.commands.add(
        ['setmouseout'],
        '',
        function () {
            if(lastMouseOverElem) {
                dispatchEvents(lastMouseOverElem, ['mouseout']);
            }
        }
    );
})();

