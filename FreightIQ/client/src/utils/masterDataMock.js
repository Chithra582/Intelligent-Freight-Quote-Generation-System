export const INITIAL_MASTER_DATA = {
  countries: [
    { countryCode: 'IN', countryName: 'India', region: 'APAC', currencyCode: 'INR', active: true },
    { countryCode: 'US', countryName: 'United States', region: 'AMER', currencyCode: 'USD', active: true },
    { countryCode: 'AE', countryName: 'United Arab Emirates', region: 'MEASA', currencyCode: 'AED', active: true },
    { countryCode: 'DE', countryName: 'Germany', region: 'EMEA', currencyCode: 'EUR', active: true },
    { countryCode: 'CN', countryName: 'China', region: 'APAC', currencyCode: 'CNY', active: true }
  ],
  ports: [
    { UNLOCODE: 'INMAA', portName: 'Chennai Port', portType: 'Sea', iataCode: 'MAA', city: 'Chennai', countryCode: 'IN', location: '13.0827° N, 80.2707° E', timezone: 'UTC+05:30', active: true },
    { UNLOCODE: 'SGSIN', portName: 'Port of Singapore', portType: 'Sea', iataCode: 'SIN', city: 'Singapore', countryCode: 'SG', location: '1.29027° N, 103.8519° E', timezone: 'UTC+08:00', active: true },
    { UNLOCODE: 'AEJEA', portName: 'Jebel Ali Port', portType: 'Sea', iataCode: 'DXB', city: 'Dubai', countryCode: 'AE', location: '25.0112° N, 55.0617° E', timezone: 'UTC+04:00', active: true },
    { UNLOCODE: 'LKCMB', portName: 'Port of Colombo', portType: 'Sea', iataCode: 'CMB', city: 'Colombo', countryCode: 'LK', location: '6.9497° N, 79.8456° E', timezone: 'UTC+05:30', active: true },
    { UNLOCODE: 'NLRTM', portName: 'Port of Rotterdam', portType: 'Sea', iataCode: 'RTM', city: 'Rotterdam', countryCode: 'NL', location: '51.9244° N, 4.4777° E', timezone: 'UTC+01:00', active: true },
    { UNLOCODE: 'INNSA', portName: 'Nhava Sheva (JNPT)', portType: 'Sea', iataCode: 'BOM', city: 'Navi Mumbai', countryCode: 'IN', location: '18.9500° N, 72.9500° E', timezone: 'UTC+05:30', active: true },
    { UNLOCODE: 'USLAX', portName: 'Port of Los Angeles', portType: 'Sea', iataCode: 'LAX', city: 'Los Angeles', countryCode: 'US', location: '33.7288° N, 118.2620° W', timezone: 'UTC-08:00', active: true },
    { UNLOCODE: 'DEHAM', portName: 'Port of Hamburg', portType: 'Sea', iataCode: 'HAM', city: 'Hamburg', countryCode: 'DE', location: '53.5458° N, 9.9644° E', timezone: 'UTC+01:00', active: true },
    { UNLOCODE: 'CNSHA', portName: 'Port of Shanghai', portType: 'Sea', iataCode: 'PVG', city: 'Shanghai', countryCode: 'CN', location: '31.2243° N, 121.4691° E', timezone: 'UTC+08:00', active: true }
  ],
  tradeLanes: [
    { laneCode: 'INMAA-SGSIN', laneName: 'Chennai to Singapore', originPortCode: 'INMAA', destinationPortCode: 'SGSIN', transitTimeDays: 6, carrierCode: 'ABC', active: true },
    { laneCode: 'INMAA-AEJEA', laneName: 'Chennai to Dubai', originPortCode: 'INMAA', destinationPortCode: 'AEJEA', transitTimeDays: 9, carrierCode: 'XYZ', active: true },
    { laneCode: 'INNSA-AEJEA', laneName: 'Nhava Sheva to Jebel Ali', originPortCode: 'INNSA', destinationPortCode: 'AEJEA', transitTimeDays: 7, carrierCode: 'MSK', active: true },
    { laneCode: 'CNSHA-USLAX', laneName: 'Shanghai to Los Angeles', originPortCode: 'CNSHA', destinationPortCode: 'USLAX', transitTimeDays: 14, carrierCode: 'COSCO', active: true },
    { laneCode: 'DEHAM-INNSA', laneName: 'Hamburg to Nhava Sheva', originPortCode: 'DEHAM', destinationPortCode: 'INNSA', transitTimeDays: 21, carrierCode: 'HLD', active: true },
    { laneCode: 'USLAX-AEJEA', laneName: 'Los Angeles to Jebel Ali', originPortCode: 'USLAX', destinationPortCode: 'AEJEA', transitTimeDays: 28, carrierCode: 'ONE', active: true }
  ],
  carriers: [
    { carrierCode: 'ABC', carrierName: 'ABC Shipping', mode: 'Ocean', serviceTypes: 'FCL, LCL', reliabilityScore: 95, contractTier: 'Tier 1', apiEnabled: true, active: true },
    { carrierCode: 'XYZ', carrierName: 'XYZ Shipping', mode: 'Ocean', serviceTypes: 'FCL, LCL', reliabilityScore: 91, contractTier: 'Tier 1', apiEnabled: true, active: true },
    { carrierCode: 'MSK', carrierName: 'Maersk Line', mode: 'Ocean', serviceTypes: 'FCL, LCL', reliabilityScore: 94, contractTier: 'Tier 1', apiEnabled: true, active: true },
    { carrierCode: 'COSCO', carrierName: 'COSCO Shipping', mode: 'Ocean', serviceTypes: 'FCL', reliabilityScore: 89, contractTier: 'Tier 2', apiEnabled: false, active: true },
    { carrierCode: 'HLD', carrierName: 'Hapag-Lloyd', mode: 'Ocean', serviceTypes: 'FCL, LCL', reliabilityScore: 91, contractTier: 'Tier 1', apiEnabled: true, active: true },
    { carrierCode: 'ONE', carrierName: 'Ocean Network Express (ONE)', mode: 'Ocean', serviceTypes: 'FCL', reliabilityScore: 88, contractTier: 'Tier 2', apiEnabled: true, active: true },
    { carrierCode: 'FEDEX', carrierName: 'FedEx Express', mode: 'Air', serviceTypes: 'Express, LCL', reliabilityScore: 97, contractTier: 'Tier 1', apiEnabled: true, active: true },
    { carrierCode: 'EMIRATES', carrierName: 'Emirates SkyCargo', mode: 'Air', serviceTypes: 'Express', reliabilityScore: 95, contractTier: 'Tier 1', apiEnabled: true, active: true }
  ],
  serviceTypes: [
    { serviceCode: 'FCL', serviceName: 'Full Container Load', transportMode: 'Ocean', description: 'Exclusive use of a shipping container', active: true },
    { serviceCode: 'LCL', serviceName: 'Less than Container Load', transportMode: 'Ocean', description: 'Shared container space for smaller shipments', active: true },
    { serviceCode: 'EXP', serviceName: 'Express Courier', transportMode: 'Air', description: 'Time-sensitive express door-to-door courier service', active: true },
    { serviceCode: 'AIR_STD', serviceName: 'Standard Air Cargo', transportMode: 'Air', description: 'Standard airport-to-airport cargo transit', active: true },
    { serviceCode: 'ROAD_LTL', serviceName: 'Less than Truckload', transportMode: 'Road', description: 'Ground transportation sharing truck space', active: true }
  ],
  containerTypes: [
    { containerCode: '20GP', containerName: "20' General Purpose", lengthFt: 20, widthFt: 8, heightFt: 8.5, maxPayloadKg: 28200, tareWeightKg: 2300, active: true },
    { containerCode: '40GP', containerName: "40' General Purpose", lengthFt: 40, widthFt: 8, heightFt: 8.5, maxPayloadKg: 28800, tareWeightKg: 3700, active: true },
    { containerCode: '40HC', containerName: "40' High Cube", lengthFt: 40, widthFt: 8, heightFt: 9.5, maxPayloadKg: 28600, tareWeightKg: 3950, active: true },
    { containerCode: '20RF', containerName: "20' Refrigerated (Reefer)", lengthFt: 20, widthFt: 8, heightFt: 8.5, maxPayloadKg: 27400, tareWeightKg: 3050, active: true },
    { containerCode: '40RF', containerName: "40' Refrigerated (Reefer)", lengthFt: 40, widthFt: 8, heightFt: 9.5, maxPayloadKg: 29400, tareWeightKg: 4380, active: true }
  ],
  cargoTypes: [
    { cargoTypeCode: 'GEN', cargoTypeName: 'General Dry Cargo', description: 'Standard non-hazardous boxed or palletized cargo', specialHandlingRequirements: 'None', active: true },
    { cargoTypeCode: 'HAZ', cargoTypeName: 'Hazardous Materials (HazMat)', description: 'Chemicals, flammable goods, battery items under IMO/IATA regulations', specialHandlingRequirements: 'UN Number verification, dangerous goods declaration, safety packaging', active: true },
    { cargoTypeCode: 'PER', cargoTypeName: 'Perishable Goods', description: 'Food products, plants, or fresh products requiring speed', specialHandlingRequirements: 'Phytosanitary certificate, constant refrigeration, priority boarding', active: true },
    { cargoTypeCode: 'VAL', cargoTypeName: 'Valuable / High-Security Cargo', description: 'High-value electronics, jewelry, or fine art', specialHandlingRequirements: 'Secured warehouse storage, armed escort routing, dual driver tracking', active: true },
    { cargoTypeCode: 'TEMP', cargoTypeName: 'Temperature Controlled', description: 'Goods requiring specific temperature thresholds', specialHandlingRequirements: 'Continuous reefer monitoring, data logger insertion', active: true }
  ],
  commodities: [
    { hsCode: '851712', commodityName: 'Smartphones & Mobile Phones', cargoTypeCode: 'GEN', dutyRatePct: 10.0, active: true },
    { hsCode: '520811', commodityName: 'Unbleached Woven Cotton Fabric', cargoTypeCode: 'GEN', dutyRatePct: 7.5, active: true },
    { hsCode: '293339', commodityName: 'Pharmaceutical raw compounds', cargoTypeCode: 'HAZ', dutyRatePct: 12.5, active: true },
    { hsCode: '847130', commodityName: 'Laptops & Portable Computers', cargoTypeCode: 'GEN', dutyRatePct: 5.0, active: true },
    { hsCode: '090121', commodityName: 'Roasted Coffee Beans', cargoTypeCode: 'PER', dutyRatePct: 15.0, active: true }
  ],
  packagingTypes: [
    { packageCode: 'PLT', packageName: 'Standard Wooden Pallet', standardLengthCm: 120, standardWidthCm: 80, standardHeightCm: 160, maxWeightKg: 1000, active: true },
    { packageCode: 'BOX', packageName: 'Cardboard Box / Carton', standardLengthCm: 60, standardWidthCm: 40, standardHeightCm: 40, maxWeightKg: 30, active: true },
    { packageCode: 'CRT', packageName: 'Heavy Wooden Crate', standardLengthCm: 150, standardWidthCm: 100, standardHeightCm: 120, maxWeightKg: 2500, active: true },
    { packageCode: 'DRM', packageName: 'Steel Drum', standardLengthCm: 60, standardWidthCm: 60, standardHeightCm: 90, maxWeightKg: 250, active: true },
    { packageCode: 'BULK', packageName: 'Unpackaged / Bulk Cargo', standardLengthCm: 0, standardWidthCm: 0, standardHeightCm: 0, maxWeightKg: 50000, active: true }
  ],
  incoterms: [
    { incotermCode: 'EXW', incotermName: 'Ex Works', responsibilities: 'Buyer bears all costs and risks from sellers premises.', active: true },
    { incotermCode: 'FOB', incotermName: 'Free On Board', responsibilities: 'Seller loads goods on vessel. Buyer bears costs and risks thereafter.', active: true },
    { incotermCode: 'CIF', incotermName: 'Cost, Insurance & Freight', responsibilities: 'Seller pays ocean freight and marine insurance to port of destination.', active: true },
    { incotermCode: 'DDP', incotermName: 'Delivered Duty Paid', responsibilities: 'Seller bears all risks and costs including import customs clearance and duties to buyers door.', active: true },
    { incotermCode: 'DAP', incotermName: 'Delivered At Place', responsibilities: 'Seller delivers goods to buyers location, buyer handles customs clearance.', active: true }
  ],
  chargeHeads: [
    { chargeCode: 'OCF', chargeName: 'Ocean Freight Base Rate', chargeType: 'Freight', defaultCurrency: 'USD', active: true },
    { chargeCode: 'AWB', chargeName: 'Air Waybill Fee', chargeType: 'Documentation', defaultCurrency: 'USD', active: true },
    { chargeCode: 'BAF', chargeName: 'Bunker Adjustment Factor (Fuel)', chargeType: 'Surcharge', defaultCurrency: 'USD', active: true },
    { chargeCode: 'THC', chargeName: 'Terminal Handling Charge', chargeType: 'Local Handling', defaultCurrency: 'INR', active: true },
    { chargeCode: 'IHC', chargeName: 'Inland Haulage Charge', chargeType: 'Inland', defaultCurrency: 'INR', active: true },
    { chargeCode: 'DOC', chargeName: 'Documentation Fee', chargeType: 'Documentation', defaultCurrency: 'USD', active: true },
    { chargeCode: 'SEC', chargeName: 'Security Surcharge', chargeType: 'Surcharge', defaultCurrency: 'USD', active: true }
  ],
  currencies: [
    { currencyCode: 'USD', currencyName: 'US Dollar', exchangeRateToUSD: 1.0, lastUpdated: '2026-08-14T12:00:00Z', active: true },
    { currencyCode: 'INR', currencyName: 'Indian Rupee', exchangeRateToUSD: 0.012, lastUpdated: '2026-08-14T12:00:00Z', active: true },
    { currencyCode: 'EUR', currencyName: 'Euro', exchangeRateToUSD: 1.08, lastUpdated: '2026-08-14T12:00:00Z', active: true },
    { currencyCode: 'AED', currencyName: 'UAE Dirham', exchangeRateToUSD: 0.27, lastUpdated: '2026-08-14T12:00:00Z', active: true },
    { currencyCode: 'CNY', currencyName: 'Chinese Yuan', exchangeRateToUSD: 0.14, lastUpdated: '2026-08-14T12:00:00Z', active: true }
  ],
  rateCards: [
    { rateCardId: 'RC-0001', carrierCode: 'MSK', laneCode: 'INNSA-AEJEA', serviceCode: 'FCL', containerCode: '20GP', baseRate: 1200, currencyCode: 'USD', validFrom: '2026-08-01', validTo: '2026-12-31', active: true },
    { rateCardId: 'RC-0002', carrierCode: 'COSCO', laneCode: 'CNSHA-USLAX', serviceCode: 'FCL', containerCode: '40HC', baseRate: 2400, currencyCode: 'USD', validFrom: '2026-08-01', validTo: '2026-12-31', active: true },
    { rateCardId: 'RC-0003', carrierCode: 'EMIRATES', laneCode: 'INNSA-AEJEA', serviceCode: 'AIR_STD', containerCode: 'N/A', baseRate: 3.5, currencyCode: 'USD', validFrom: '2026-08-10', validTo: '2026-11-30', active: true },
    { rateCardId: 'RC-0004', carrierCode: 'FEDEX', laneCode: 'CNSHA-USLAX', serviceCode: 'EXP', containerCode: 'N/A', baseRate: 7.8, currencyCode: 'USD', validFrom: '2026-08-10', validTo: '2026-10-31', active: true }
  ],
  surchargeRules: [
    { surchargeId: 'SC-0001', surchargeName: 'Peak Season Surcharge (PSS)', chargeCode: 'SEC', calculationMethod: 'Flat Rate', value: 250, currencyCode: 'USD', applicableModes: 'Ocean, Air', active: true },
    { surchargeId: 'SC-0002', surchargeName: 'War Risk Fuel Surcharge', chargeCode: 'BAF', calculationMethod: 'Percentage', value: 8.5, currencyCode: 'USD', applicableModes: 'Ocean', active: true },
    { surchargeId: 'SC-0003', surchargeName: 'Chassis Usage Surcharge', chargeCode: 'THC', calculationMethod: 'Flat Rate', value: 75, currencyCode: 'USD', applicableModes: 'Ocean, Road', active: true }
  ],
  marginRules: [
    { ruleId: 'MR-0001', ruleName: 'Standard Retail Markup', customerTier: 'Retail', markupMethod: 'Percentage', markupValue: 15, minMarginAmount: 50, active: true },
    { ruleId: 'MR-0002', ruleName: 'Gold Tier Partner Discount', customerTier: 'Gold', markupMethod: 'Percentage', markupValue: -5, minMarginAmount: 0, active: true },
    { ruleId: 'MR-0003', ruleName: 'Urgent Cargo Premium Margin', customerTier: 'Premium', markupMethod: 'Flat Rate', markupValue: 120, minMarginAmount: 100, active: true }
  ],
  customsTariffs: [
    { tariffId: 'CT-0001', hsCode: '851712', originCountryCode: 'CN', destinationCountryCode: 'IN', dutyRatePct: 20.0, additionalTaxPct: 18.0, active: true },
    { tariffId: 'CT-0002', hsCode: '847130', originCountryCode: 'US', destinationCountryCode: 'IN', dutyRatePct: 10.0, additionalTaxPct: 18.0, active: true },
    { tariffId: 'CT-0003', hsCode: '293339', originCountryCode: 'DE', destinationCountryCode: 'IN', dutyRatePct: 12.5, additionalTaxPct: 18.0, active: true }
  ],
  documentTypes: [
    { documentCode: 'BOL', documentName: 'Bill of Lading', mandatoryForModes: 'Ocean, Rail', description: 'Contract of carriage and receipt of goods for ocean shipments.', active: true },
    { documentCode: 'AWB', documentName: 'Air Waybill', mandatoryForModes: 'Air', description: 'Official air cargo dispatch receipt and contract.', active: true },
    { documentCode: 'COO', documentName: 'Certificate of Origin', mandatoryForModes: 'Ocean, Air, Rail, Road', description: 'Document certifying the country where goods were manufactured.', active: true },
    { documentCode: 'CI', documentName: 'Commercial Invoice', mandatoryForModes: 'Ocean, Air, Rail, Road', description: 'Commercial billing record showing goods value and specifications.', active: true },
    { documentCode: 'PL', documentName: 'Packing List', mandatoryForModes: 'Ocean, Air, Rail, Road', description: 'Detailed breakdown of items, weights, and packaging styles.', active: true }
  ]
};
