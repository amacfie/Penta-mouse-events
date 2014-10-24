/*jshint moz:true*/
// based on hints-mouse-events.js 
// https://g.mozest.com/viewthread.php?tid=38908&amp;page=3#pid261071
// and inspired by Visual Event (VE)
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
            ["description", {}, "Trigger mouseover on hint"]
        ],
        ["item", {},
            ["spec", {}, ";j"],
            ["description", {}, "Trigger left click at hint"]
        ],
        ["item", {},
            ["spec", {}, ";r"],
            ["description", {}, "Trigger mouseout at hint"]
        ],

    ]
];

(function () {
    var debug = false;

    if (debug) {
        //console is the browser console
        //https://developer.mozilla.org/en-US/docs/Tools/Browser_Console
        console.log('Loaded');
    }

    var getFilter = function (eventTypes) {
        //Assuming this doesn't have to detect hidden elements
        //(VE line 579)
        return function (elem) {
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

    // As mentioned here
    // https://developer.mozilla.org/en-US/docs/Extensions/Common_causes_of_memory_leaks_in_extensions
    // an alternative approach is to do the following when the lastMouseOverElem
    // value is set: attach a listener to the document unload event which
    // clears the lastMouseOverElem
    // also see http://stackoverflow.com/q/25041864/371334
    var lastMouseOverElem = {
        weakReference: null,
        exists: function () {
            return Boolean( this.weakReference && 
                            this.weakReference.get() && 
                            this.weakReference.get().parentNode );
        },
        getElement: function () {
            if (this.exists()) {
                return this.weakReference.get();
            } else {
                throw 'Last mouseover element does not exist';
            }
        },
        setElement: function (elem) {
            this.weakReference = Components.utils.getWeakReference(elem);
        }
    };

    dactyl.modules.hints.addMode(
        'h',
        'Simulate mouse hover on hint',
        function (elem) {
            if (debug) {
                console.log('Current weak ref obj: ', 
                            lastMouseOverElem.weakReference);
            }
            if (lastMouseOverElem.exists()) {
                if (debug) {
                    console.log('Current last mouseover elem: ',
                                lastMouseOverElem.getElement());
                }
                dispatchEvents(lastMouseOverElem.getElement(), ['mouseout']);
            }
            dispatchEvents(elem, ['mouseover', 'mousemove']);
            lastMouseOverElem.setElement(elem);
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

    //Undocumented
    group.commands.add(
        ['setmouseout'],
        '',
        function () {
            if (lastMouseOverElem.exists()) {
                dispatchEvents(lastMouseOverElem.getElement(), ['mouseout']);
            }
        }
    );
})();

