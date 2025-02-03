sap.ui.define([], function () {
    "use strict";

    return {
        initPDFJS: function() {
            // Set worker path
            if (typeof pdfjsLib !== "undefined") {
                pdfjsLib.GlobalWorkerOptions.workerSrc = sap.ui.require.toUrl("com/pdfextract/libs/pdfjs/build/pdf.worker.js");
            }
        },

        extractTextFromPDF: async function(file) {
            try {
                // Initialize PDF.js if not already done
                this.initPDFJS();

                // Convert File to ArrayBuffer
                const arrayBuffer = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(file);
                });

                // Load PDF document
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                let extractedText = '';

                // Extract text from all pages
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    extractedText += textContent.items.map(item => item.str).join(' ');
                }

                return extractedText;
            } catch (error) {
                throw new Error(`PDF extraction failed: ${error.message}`);
            }
        }
    };
});
