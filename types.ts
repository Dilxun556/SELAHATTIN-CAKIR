export type FabricType = string;
export type Size = string;

export interface TechpackFormData {
  category: string;
  modelCode: string;
  styleName: string;
  brandName: string;
  inspirationPhoto: File | null;
  technicalDrawing: File | null;
  productDescription: string;
  fabricType: FabricType | '';
  fabricContent: string;
  fabricGSM: number | '';
  fabricColor: string;
  fabricSamplePhoto: File | null;
  selectedSizes: Size[];
  totalQuantity: number | '';
  assortiPackDetails: string;
  designSpecDetails: string;
  artNo: string;
  collectionDate: string;
  backNeckLabel: string;
  sewingTicket: string;
  polyBagInfo: string;
  tissuePaperInfo: string;
  brandingTotalPieces: number | '';
  sewingInstructions: string;
  printAppliqueInfo: string;
  labelInfo: string;
  hangTagInfo: string;
  packagingInfo: string;
  measurementsDetails: string;
}