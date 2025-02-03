sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("com.pdfextract.controller.Main", {
        onInit: function () {
            // Initialize view model
            var oViewModel = new JSONModel({
                hasExtractedData: false
            });
            this.getView().setModel(oViewModel, "viewModel");
            
            // Initialize data model
            var oDataModel = new JSONModel({
                SalesOrderHeader: {},
                SalesOrderItems: []
            });
            this.getView().setModel(oDataModel);
        },

        handleFileSelect: function (oEvent) {
            var oFile = oEvent.getParameter("files")[0];
            if (oFile && oFile.type === "application/pdf") {
                this._processPDFFile(oFile);
            } else {
                MessageBox.error("Please select a valid PDF file");
            }
        },

        _processPDFFile: async function (oFile) {
            try {
                // Using pdf.js library to extract text
                const pdfjsLib = window['pdfjs-dist/build/pdf'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'path/to/pdf.worker.js';

                const arrayBuffer = await oFile.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                
                let extractedText = '';
                
                // Extract text from all pages
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    extractedText += textContent.items.map(item => item.str).join(' ');
                }

                // Process extracted text and create data structure
                const extractedData = this._parseExtractedText(extractedText);
                
                // Update models
                const oModel = this.getView().getModel();
                oModel.setData(extractedData);
                
                this.getView().getModel("viewModel").setProperty("/hasExtractedData", true);
                this.byId("salesOrderTable").setVisible(true);
                
            } catch (error) {
                MessageBox.error("Error processing PDF: " + error.message);
            }
        },

        _parseExtractedText: function (text) {
            // Implement your parsing logic here based on PDF structure
            // This is a sample implementation
            return {
                SalesOrderHeader: {
                    SalesOrderId: "Sample ID",
                    CustomerName: "Sample Customer",
                    OrderDate: new Date()
                },
                SalesOrderItems: [
                    {
                        SalesOrderId: "Sample ID",
                        Item: "Item 1",
                        Quantity: 1,
                        Price: 100
                    }
                ]
            };
        },

        onSavePress: function () {
            const oModel = this.getView().getModel();
            const oData = oModel.getData();
            
            // Create OData service
            const oDataModel = this.getOwnerComponent().getModel();
            
            // Save header
            oDataModel.create("/SalesOrderHeaderSet", oData.SalesOrderHeader, {
                success: () => {
                    // Save items
                    const aPromises = oData.SalesOrderItems.map(item =>
                        new Promise((resolve, reject) => {
                            oDataModel.create("/SalesOrderItemSet", item, {
                                success: resolve,
                                error: reject
                            });
                        })
                    );

                    Promise.all(aPromises)
                        .then(() => {
                            MessageBox.success("Data saved successfully");
                            this.getView().getModel("viewModel").setProperty("/hasExtractedData", false);
                            this.byId("salesOrderTable").setVisible(false);
                        })
                        .catch(error => {
                            MessageBox.error("Error saving items: " + error.message);
                        });
                },
                error: (error) => {
                    MessageBox.error("Error saving header: " + error.message);
                }
            });
        }
    });
});
