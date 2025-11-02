import React, { useState, useCallback } from 'react';
import ImageUpload from './components/ImageUpload';
import SelectInput from './components/SelectInput';
import TextInput from './components/TextInput';
import NumberInput from './components/NumberInput';
import CheckboxGroup from './components/CheckboxGroup';
import Button from './components/Button';
import { TechpackFormData, FabricType, Size } from './types';
import { FABRIC_TYPES, SIZES } from './constants';
import jsPDF from 'jspdf';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<TechpackFormData>({
    category: '',
    modelCode: '',
    styleName: '',
    brandName: 'SAMO', // Changed from BUMBACEL to SAMO
    inspirationPhoto: null,
    technicalDrawing: null,
    productDescription: '',
    fabricType: '',
    fabricContent: '',
    fabricGSM: '',
    fabricColor: '#60a5fa',
    fabricSamplePhoto: null,
    selectedSizes: [],
    totalQuantity: '',
    assortiPackDetails: '',
    designSpecDetails: '',
    artNo: '',
    collectionDate: '',
    backNeckLabel: '',
    sewingTicket: '',
    polyBagInfo: '',
    tissuePaperInfo: '',
    brandingTotalPieces: '',
    sewingInstructions: '',
    printAppliqueInfo: '',
    labelInfo: '',
    hangTagInfo: '',
    packagingInfo: '',
    measurementsDetails: '',
  });

  const handleFileChange = useCallback((field: keyof TechpackFormData, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  }, []);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleNumberChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
  }, []);

  const handleSizesChange = useCallback((newSizes: Size[]) => {
    setFormData((prev) => ({ ...prev, selectedSizes: newSizes }));
  }, []);

  const generatePdf = useCallback(async () => {
    const doc = new jsPDF({ format: 'a3' }); // Changed to A3 format
    let yPos = 20;
    const margin = 20; // Increased margin for A3
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const textWidth = pageWidth - (2 * margin);

    const addSectionTitle = (title: string, brand?: boolean) => {
      doc.setFontSize(22); // Increased font size for A3
      doc.setTextColor(20);
      doc.text(title, margin, yPos);
      if (brand) {
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text(`Brand: ${formData.brandName}`, margin + doc.getTextWidth(title) + 10, yPos - 5);
      }
      yPos += 12;
      doc.setDrawColor(150);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15; // Increased space after title
    };

    const addKeyValue = (key: string, value: string | number | undefined, alignRight = false) => {
      doc.setFontSize(14); // Increased font size for A3
      doc.setTextColor(0);
      if (alignRight) {
        doc.text(`${key}: ${String(value || 'N/A')}`, pageWidth - margin, yPos, { align: 'right' });
      } else {
        doc.text(`${key}:`, margin, yPos);
        doc.setTextColor(50);
        doc.text(String(value || 'N/A'), margin + doc.getTextWidth(`${key}: `), yPos);
      }
      yPos += 8; // Increased line spacing for A3
    };

    const addTextAreaContent = (title: string, content: string | undefined) => {
      if (content) {
        doc.setFontSize(16); // Increased font size for A3
        doc.setTextColor(0);
        doc.text(`${title}:`, margin, yPos);
        yPos += 8;
        doc.setFontSize(14); // Increased font size for A3
        doc.setTextColor(50);
        const splitContent = doc.splitTextToSize(content, textWidth);
        doc.text(splitContent, margin, yPos);
        yPos += (splitContent.length * 8) + 12; // Adjusted line spacing
      } else {
        addKeyValue(title, 'N/A');
      }
    };

    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    // Page 1: Main Product Info
    doc.setFontSize(36); // Larger title for A3
    doc.setTextColor(20);
    doc.text('SAMO TECHPACK ORDER FORM', pageWidth / 2, yPos, { align: 'center' }); // Updated brand and title
    yPos += 15;
    doc.setFontSize(18); // Larger subtitle
    doc.setTextColor(100);
    doc.text('Knitwear Product Details', pageWidth / 2, yPos, { align: 'center' });
    yPos += 30;

    checkPageBreak(80);
    addSectionTitle('General Information', true);
    addKeyValue('Category', formData.category);
    addKeyValue('Model Code', formData.modelCode);
    addKeyValue('Style Name', formData.styleName);
    addKeyValue('Brand Name', formData.brandName);
    checkPageBreak(50);
    addTextAreaContent('Product Description', formData.productDescription);
    checkPageBreak(50);

    addSectionTitle('Fabric Details');
    addKeyValue('Fabric Type', formData.fabricType);
    addTextAreaContent('Fabric Content', formData.fabricContent);
    addKeyValue('Fabric GSM (gr/m²)', formData.fabricGSM || 'N/A');
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Fabric Color:', margin, yPos);
    doc.setFillColor(formData.fabricColor);
    doc.rect(margin + doc.getTextWidth('Fabric Color: ') + 5, yPos - 6, 12, 12, 'F'); // Slightly larger color swatch
    doc.setTextColor(50);
    doc.text(formData.fabricColor, margin + doc.getTextWidth('Fabric Color: ') + 25, yPos);
    yPos += 8;
    checkPageBreak(150); // Increased space for photos

    if (formData.fabricSamplePhoto) {
      const imgData = await fileToBase64(formData.fabricSamplePhoto);
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Fabric Sample Photo:', margin, yPos);
      yPos += 8;
      const img = new Image();
      img.src = imgData;
      await new Promise(resolve => { img.onload = resolve; });
      const imgWidth = 90; // Increased image width for A3
      const imgHeight = (img.height * imgWidth) / img.width;
      doc.addImage(imgData, 'JPEG', margin, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 15;
      checkPageBreak(imgHeight + 30);
    }
    yPos += 5;

    addSectionTitle('Order Quantities & Sizes');
    addKeyValue('Selected Sizes', formData.selectedSizes.length > 0 ? formData.selectedSizes.join(', ') : 'N/A');
    addKeyValue('Total Quantity', formData.totalQuantity || 'N/A');
    addTextAreaContent('Assorti Pack Details (Colorways, Sizes Distribution)', formData.assortiPackDetails);

    // Page 2: Design Specifications & Drawings
    doc.addPage();
    yPos = margin;
    addSectionTitle('Design Specifications & Drawings');
    checkPageBreak(180); // More space for images on A3

    if (formData.inspirationPhoto) {
      const imgData = await fileToBase64(formData.inspirationPhoto);
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Inspiration Photo:', margin, yPos);
      yPos += 8;
      const img = new Image();
      img.src = imgData;
      await new Promise(resolve => { img.onload = resolve; });
      const imgWidth = 120; // Increased image width for A3
      const imgHeight = (img.height * imgWidth) / img.width;
      doc.addImage(imgData, 'JPEG', margin, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 15;
      checkPageBreak(imgHeight + 30);
    }

    if (formData.technicalDrawing) {
      const imgData = await fileToBase64(formData.technicalDrawing);
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Technical Drawing:', margin, yPos);
      yPos += 8;
      const img = new Image();
      img.src = imgData;
      await new Promise(resolve => { img.onload = resolve; });
      const imgWidth = 120; // Increased image width for A3
      const imgHeight = (img.height * imgWidth) / img.width;
      doc.addImage(imgData, 'JPEG', margin, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 15;
      checkPageBreak(imgHeight + 30);
    }
    addTextAreaContent('Detailed Design Specifications', formData.designSpecDetails);

    // Page 3: Branding & Sewing
    doc.addPage();
    yPos = margin;
    addSectionTitle('Branding Pack Information');
    addKeyValue('ART No', formData.artNo);
    addKeyValue('Collection Date', formData.collectionDate);
    addKeyValue('Back Neck Label', formData.backNeckLabel);
    addKeyValue('Sewing Ticket', formData.sewingTicket);
    addKeyValue('Poly Bag Info', formData.polyBagInfo);
    addKeyValue('Tissue Paper Info', formData.tissuePaperInfo);
    addKeyValue('Total Branding Pieces', formData.brandingTotalPieces || 'N/A');
    checkPageBreak(80);

    addSectionTitle('Sewing & Production Instructions');
    addTextAreaContent('Sewing Instructions', formData.sewingInstructions);
    checkPageBreak(80);

    addSectionTitle('Print & Applique Information');
    addTextAreaContent('Print & Applique Details', formData.printAppliqueInfo);

    // Page 4: Labels & Packaging
    doc.addPage();
    yPos = margin;
    addSectionTitle('Label Information');
    addTextAreaContent('Label Details (Wash Care, Size, Content)', formData.labelInfo);
    checkPageBreak(80);

    addSectionTitle('Hang Tags Information');
    addTextAreaContent('Hang Tag Details', formData.hangTagInfo);
    checkPageBreak(80);

    addSectionTitle('Packaging Information');
    addTextAreaContent('Packaging Details', formData.packagingInfo);

    // Page 5: Measurements
    doc.addPage();
    yPos = margin;
    addSectionTitle('Measurements Chart');
    addTextAreaContent('Measurement Chart Details (Points of Measurements, Tolerance)', formData.measurementsDetails);

    doc.save('samo_techpack_order_form.pdf'); // Updated filename
  }, [formData]);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await generatePdf();
  }, [generatePdf]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-white shadow-xl rounded-lg p-6 sm:p-8 lg:p-10 my-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 text-center mb-8">
          SAMO Techpack Order Form
        </h1>
        <p className="text-gray-600 text-center mb-10 text-lg">
          Create and download your knitwear product techpack form as a PDF.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* General Information */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">General Product Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <TextInput
                id="category"
                name="category"
                label="Category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., WOMEN, MEN, UNISEX"
              />
              <TextInput
                id="modelCode"
                name="modelCode"
                label="Model Code"
                value={formData.modelCode}
                onChange={handleChange}
                placeholder="e.g., MODEL-7, BW-0007"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                id="styleName"
                name="styleName"
                label="Style Name"
                value={formData.styleName}
                onChange={handleChange}
                placeholder="e.g., LARGE TROUSERS"
              />
              <TextInput
                id="brandName"
                name="brandName"
                label="Brand Name"
                value={formData.brandName}
                onChange={handleChange}
                placeholder="e.g., SAMO"
              />
            </div>
          </div>

          {/* Design & Drawings */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Design & Drawings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload
                id="inspirationPhoto"
                label="Upload Inspiration Photo"
                onFileChange={(file) => handleFileChange('inspirationPhoto', file)}
              />
              <ImageUpload
                id="technicalDrawing"
                label="Upload Technical Drawing"
                onFileChange={(file) => handleFileChange('technicalDrawing', file)}
              />
            </div>
            <TextInput
              id="productDescription"
              name="productDescription"
              label="Product Description"
              value={formData.productDescription}
              onChange={handleChange}
              placeholder="Provide detailed product description, special requests, and design features here."
              multiline
              rows={5}
            />
            <TextInput
              id="designSpecDetails"
              name="designSpecDetails"
              label="Detailed Design Specifications (e.g., pocket details, seam types)"
              value={formData.designSpecDetails}
              onChange={handleChange}
              placeholder="e.g., RUBBER BAND 4cm, 1/8 inch NEEDLE 4 THREAD COVERSTITCH"
              multiline
              rows={4}
            />
          </div>

          {/* Fabric Details */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Fabric Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <SelectInput
                id="fabricType"
                name="fabricType"
                label="Select Fabric Type"
                options={FABRIC_TYPES}
                value={formData.fabricType}
                onChange={handleChange}
                placeholder="Select fabric type"
              />
              <NumberInput
                id="fabricGSM"
                name="fabricGSM"
                label="Fabric GSM (gr/m²)"
                value={formData.fabricGSM}
                onChange={handleNumberChange}
                placeholder="e.g., 200, 280"
                min={50}
                max={500}
              />
            </div>
            <TextInput
              id="fabricContent"
              name="fabricContent"
              label="Fabric Content"
              value={formData.fabricContent}
              onChange={handleChange}
              placeholder="e.g., 80% Cotton, 20% Polyester"
              multiline
              rows={3}
            />
            <div className="flex items-center gap-4 mb-6">
              <TextInput
                id="fabricColor"
                name="fabricColor"
                label="Fabric Color"
                value={formData.fabricColor}
                onChange={handleChange}
                type="color"
                className="h-10 w-20 p-1 border-gray-300"
              />
              <span className="text-sm text-gray-600">Selected Color: {formData.fabricColor}</span>
            </div>
            <ImageUpload
              id="fabricSamplePhoto"
              label="Upload Fabric Sample Photo"
              onFileChange={(file) => handleFileChange('fabricSamplePhoto', file)}
            />
          </div>

          {/* Order Quantities */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Quantities & Sizes</h2>
            <CheckboxGroup
              idPrefix="sizes"
              label="Select Sizes to Order"
              options={SIZES}
              selectedValues={formData.selectedSizes}
              onChange={handleSizesChange}
            />
            <NumberInput
              id="totalQuantity"
              name="totalQuantity"
              label="Total Order Quantity"
              value={formData.totalQuantity}
              onChange={handleNumberChange}
              placeholder="e.g., 1000"
              min={1}
            />
            <TextInput
              id="assortiPackDetails"
              name="assortiPackDetails"
              label="Assorti Pack Details (Colorways, Sizes Distribution)"
              value={formData.assortiPackDetails}
              onChange={handleChange}
              placeholder="e.g., A Black: S-2, M-2, L-2..."
              multiline
              rows={4}
            />
          </div>

          {/* Branding Pack Information */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Branding Pack Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <TextInput
                id="artNo"
                name="artNo"
                label="ART No."
                value={formData.artNo}
                onChange={handleChange}
                placeholder="e.g., 12345"
              />
              <TextInput
                id="collectionDate"
                name="collectionDate"
                label="Collection Date"
                value={formData.collectionDate}
                onChange={handleChange}
                placeholder="e.g., 2023-FALL"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <TextInput
                id="backNeckLabel"
                name="backNeckLabel"
                label="Back Neck Label"
                value={formData.backNeckLabel}
                onChange={handleChange}
                placeholder="e.g., Woven Brand Label"
              />
              <TextInput
                id="sewingTicket"
                name="sewingTicket"
                label="Sewing Ticket"
                value={formData.sewingTicket}
                onChange={handleChange}
                placeholder="e.g., Attached inside"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <TextInput
                id="polyBagInfo"
                name="polyBagInfo"
                label="Poly Bag Info"
                value={formData.polyBagInfo}
                onChange={handleChange}
                placeholder="e.g., Frosted Poly Bag 33x28 CM"
              />
              <TextInput
                id="tissuePaperInfo"
                name="tissuePaperInfo"
                label="Tissue Paper Info"
                value={formData.tissuePaperInfo}
                onChange={handleChange}
                placeholder="e.g., White Tissue Paper"
              />
            </div>
            <NumberInput
              id="brandingTotalPieces"
              name="brandingTotalPieces"
              label="Total No. of Branding Pieces"
              value={formData.brandingTotalPieces}
              onChange={handleNumberChange}
              placeholder="e.g., 1000"
              min={1}
            />
          </div>

          {/* Sewing Instructions */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Sewing Directions</h2>
            <TextInput
              id="sewingInstructions"
              name="sewingInstructions"
              label="Detailed Sewing Instructions"
              value={formData.sewingInstructions}
              onChange={handleChange}
              placeholder="e.g., Stitch per inch: 14 (minimum), 17 (maximum). Use Spun Poly Top Thread..."
              multiline
              rows={6}
            />
          </div>

          {/* Print & Applique Info */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Print & Applique Information</h2>
            <TextInput
              id="printAppliqueInfo"
              name="printAppliqueInfo"
              label="Print & Applique Details"
              value={formData.printAppliqueInfo}
              onChange={handleChange}
              placeholder="e.g., Place the print artwork in the center of the fabric. Specify colors, techniques, dimensions."
              multiline
              rows={4}
            />
          </div>

          {/* Label Info */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Label Information</h2>
            <TextInput
              id="labelInfo"
              name="labelInfo"
              label="Detailed Label Info (Wash Care, Size, Content, Placement)"
              value={formData.labelInfo}
              onChange={handleChange}
              placeholder="e.g., Hi-Density Satin Woven Loop Fold Label. Actual Size Label 40mm x 80mm. Wash dark colors separately."
              multiline
              rows={6}
            />
          </div>

          {/* Hang Tags */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Hang Tags Information</h2>
            <TextInput
              id="hangTagInfo"
              name="hangTagInfo"
              label="Hang Tag Details"
              value={formData.hangTagInfo}
              onChange={handleChange}
              placeholder="e.g., PVC Hang Tag, 11x5 CM. Include Item No, Color, Sizes, Price."
              multiline
              rows={4}
            />
          </div>

          {/* Packaging Info */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Packaging Information</h2>
            <TextInput
              id="packagingInfo"
              name="packagingInfo"
              label="Detailed Packaging Info"
              value={formData.packagingInfo}
              onChange={handleChange}
              placeholder="e.g., Frosted Poly Bag 33x28 CM, FRONT OF POLY BAG FOR GARMENTS."
              multiline
              rows={4}
            />
          </div>

          {/* Measurements */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Measurements Chart</h2>
            <TextInput
              id="measurementsDetails"
              name="measurementsDetails"
              label="Measurement Chart Details (Points of Measurements, Tolerance)"
              value={formData.measurementsDetails}
              onChange={handleChange}
              placeholder="e.g., All measurements are in CM. A-Waist: XS-30, S-32... (refer to technical sketch for POM)"
              multiline
              rows={8}
            />
          </div>

          <div className="flex justify-center pt-4 pb-8">
            <Button type="submit" onClick={() => {}}>
              Generate Techpack
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;