export interface Nvidia {
	products: Products;
}
export interface Products {
	product?: (ProductEntity)[] | null;
}
export interface ProductEntity {
	id: number;
	name: string;
	displayName: string;
	sku: string;
	displayableProduct: string;
	manufacturerPartNumber: string;
	maximumQuantity: number;
	thumbnailImage: string;
	customAttributes: CustomAttributes;
	pricing: Pricing;
	inventoryStatus: InventoryStatus;
	relatedProducts?: (RelatedProductsEntity)[] | null;
	viewStyle: string;
}
export interface CustomAttributes {
	attribute?: (AttributeEntity)[] | null;
}
export interface AttributeEntity {
	name: string;
	type: string;
	value: string;
}
export interface Pricing {
	uri: string;
	listPrice: SalePriceWithFeesAndQuantityOrListPriceOrListPriceWithQuantityOrSalePriceWithQuantityOrTotalDiscountWithQuantity;
	listPriceWithQuantity: SalePriceWithFeesAndQuantityOrListPriceOrListPriceWithQuantityOrSalePriceWithQuantityOrTotalDiscountWithQuantity;
	salePriceWithQuantity: SalePriceWithFeesAndQuantityOrListPriceOrListPriceWithQuantityOrSalePriceWithQuantityOrTotalDiscountWithQuantity;
	formattedListPrice: string;
	formattedListPriceWithQuantity: string;
	formattedSalePriceWithQuantity: string;
	totalDiscountWithQuantity: SalePriceWithFeesAndQuantityOrListPriceOrListPriceWithQuantityOrSalePriceWithQuantityOrTotalDiscountWithQuantity;
	formattedTotalDiscountWithQuantity: string;
	listPriceIncludesTax: string;
	tax: Tax;
	feePricing: FeePricing;
}
export interface SalePriceWithFeesAndQuantityOrListPriceOrListPriceWithQuantityOrSalePriceWithQuantityOrTotalDiscountWithQuantity {
	currency: string;
	value: number;
}
export interface Tax {
	vatPercentage: number;
}
export interface FeePricing {
	salePriceWithFeesAndQuantity: SalePriceWithFeesAndQuantityOrListPriceOrListPriceWithQuantityOrSalePriceWithQuantityOrTotalDiscountWithQuantity;
	formattedSalePriceWithFeesAndQuantity: string;
}
export interface InventoryStatus {
	uri: string;
	availableQuantityIsEstimated: string;
	productIsInStock: string;
	productIsAllowsBackorders: string;
	productIsTracked: string;
	requestedQuantityAvailable: string;
	status: string;
	statusIsEstimated: string;
}
export interface RelatedProductsEntity {
	id: number;
	name: string;
	image: string;
}
