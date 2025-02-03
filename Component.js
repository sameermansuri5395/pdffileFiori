sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("com.pdfextract.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Load PDF.js library
            sap.ui.require([
                "com/pdfextract/libs/pdfjs/build/pdf"
            ], function() {
                // PDF.js is loaded
            });
        }
    });
});
