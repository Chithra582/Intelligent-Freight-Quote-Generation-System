import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Anchor,
  Map,
  Truck,
  Settings2,
  Box,
  Layers,
  Tag,
  Package,
  Scale,
  DollarSign,
  Coins,
  CreditCard,
  FileText,
  TrendingUp,
  Percent,
  ClipboardList,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Database,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import * as db from '../utils/masterDataService';


// Collection Configurations defining fields, types, relationships
const COLLECTIONS_CONFIG = [
  {
    id: 'countries',
    label: 'Countries',
    icon: Globe,
    primaryKey: 'countryCode',
    description: 'Reference list of countries, regions, and currency associations.',
    fields: [
      { name: 'countryCode', label: 'Country Code (ISO 2)', type: 'text', required: true, placeholder: 'e.g. IN, US' },
      { name: 'countryName', label: 'Country Name', type: 'text', required: true, placeholder: 'e.g. India, United States' },
      { name: 'region', label: 'Region', type: 'select', required: true, options: ['APAC', 'EMEA', 'AMER', 'MEASA'] },
      { name: 'currencyCode', label: 'Currency Code', type: 'text', required: true, placeholder: 'e.g. INR, USD' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'ports',
    label: 'Ports & Hubs',
    icon: Anchor,
    primaryKey: 'UNLOCODE',
    description: 'UNLOCODE ocean ports, airports, and dry hubs with coordinates and country routing.',
    fields: [
      { name: 'UNLOCODE', label: 'UNLOCODE / Code', type: 'text', required: true, placeholder: 'e.g. INNSA, USLAX' },
      { name: 'portName', label: 'Port / Terminal Name', type: 'text', required: true, placeholder: 'e.g. Nhava Sheva (JNPT)' },
      { name: 'portType', label: 'Port Type', type: 'select', required: true, options: ['Sea', 'Air', 'Dry Port'] },
      { name: 'iataCode', label: 'IATA Code (Airports)', type: 'text', placeholder: 'e.g. BOM' },
      { name: 'city', label: 'City', type: 'text', required: true, placeholder: 'e.g. Navi Mumbai' },
      { name: 'countryCode', label: 'Country Code', type: 'relation', relationKey: 'countries', relationValueField: 'countryCode', relationLabelField: 'countryName', required: true },
      { name: 'location', label: 'Geo Location', type: 'text', placeholder: 'e.g. 18.9500° N, 72.9500° E' },
      { name: 'timezone', label: 'Timezone', type: 'text', placeholder: 'e.g. UTC+05:30' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'tradeLanes',
    label: 'Trade Lanes',
    icon: Map,
    primaryKey: 'laneCode',
    description: 'Standardized operational corridors mapping origin-destination route metrics.',
    fields: [
      { name: 'laneCode', label: 'Lane Code', type: 'text', required: true, placeholder: 'e.g. INNSA-AEJEA' },
      { name: 'laneName', label: 'Lane Name', type: 'text', required: true, placeholder: 'e.g. Nhava Sheva to Jebel Ali' },
      { name: 'originPortCode', label: 'Origin Port (UNLOCODE)', type: 'relation', relationKey: 'ports', relationValueField: 'UNLOCODE', relationLabelField: 'portName', required: true },
      { name: 'destinationPortCode', label: 'Destination Port (UNLOCODE)', type: 'relation', relationKey: 'ports', relationValueField: 'UNLOCODE', relationLabelField: 'portName', required: true },
      { name: 'transitTimeDays', label: 'Est. Transit Time (Days)', type: 'number', required: true, placeholder: 'e.g. 7' },
      { name: 'carrierCode', label: 'Primary Carrier', type: 'relation', relationKey: 'carriers', relationValueField: 'carrierCode', relationLabelField: 'carrierName', required: true },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'carriers',
    label: 'Carriers',
    icon: Truck,
    primaryKey: 'carrierCode',
    description: 'Shipping lines, airlines, and logistics carriers with contracts, rating, and API status.',
    fields: [
      { name: 'carrierCode', label: 'Carrier Code', type: 'text', required: true, placeholder: 'e.g. MSK, COSCO' },
      { name: 'carrierName', label: 'Carrier Name', type: 'text', required: true, placeholder: 'e.g. Maersk Line' },
      { name: 'mode', label: 'Transport Mode', type: 'select', required: true, options: ['Ocean', 'Air', 'Road', 'Rail'] },
      { name: 'serviceTypes', label: 'Supported Service Types', type: 'text', placeholder: 'e.g. FCL, LCL' },
      { name: 'reliabilityScore', label: 'Reliability Score (%)', type: 'number', placeholder: 'e.g. 95' },
      { name: 'contractTier', label: 'Contract Tier', type: 'select', required: true, options: ['Tier 1', 'Tier 2', 'Tier 3'] },
      { name: 'apiEnabled', label: 'API Direct Integration', type: 'boolean', defaultValue: true },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'serviceTypes',
    label: 'Service Types',
    icon: Settings2,
    primaryKey: 'serviceCode',
    description: 'Modes of freight service rules (FCL, LCL, Express LTL).',
    fields: [
      { name: 'serviceCode', label: 'Service Code', type: 'text', required: true, placeholder: 'e.g. FCL, LCL' },
      { name: 'serviceName', label: 'Service Name', type: 'text', required: true, placeholder: 'e.g. Full Container Load' },
      { name: 'transportMode', label: 'Transport Mode', type: 'select', required: true, options: ['Ocean', 'Air', 'Road', 'Rail'] },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Detailed description of service parameters...' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'containerTypes',
    label: 'Container Types',
    icon: Box,
    primaryKey: 'containerCode',
    description: 'ISO standard specifications for shipping containers and payloads.',
    fields: [
      { name: 'containerCode', label: 'Container Code', type: 'text', required: true, placeholder: 'e.g. 20GP, 40HC' },
      { name: 'containerName', label: 'Container Name', type: 'text', required: true, placeholder: 'e.g. 40ft High Cube' },
      { name: 'lengthFt', label: 'Length (ft)', type: 'number', required: true, placeholder: 'e.g. 40' },
      { name: 'widthFt', label: 'Width (ft)', type: 'number', required: true, placeholder: 'e.g. 8' },
      { name: 'heightFt', label: 'Height (ft)', type: 'number', required: true, placeholder: 'e.g. 9.5' },
      { name: 'maxPayloadKg', label: 'Max Payload (kg)', type: 'number', required: true, placeholder: 'e.g. 28600' },
      { name: 'tareWeightKg', label: 'Tare Weight (kg)', type: 'number', required: true, placeholder: 'e.g. 3950' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'cargoTypes',
    label: 'Cargo Types',
    icon: Layers,
    primaryKey: 'cargoTypeCode',
    description: 'Material and handling classifications for shipping packages.',
    fields: [
      { name: 'cargoTypeCode', label: 'Cargo Type Code', type: 'text', required: true, placeholder: 'e.g. GEN, HAZ' },
      { name: 'cargoTypeName', label: 'Cargo Type Name', type: 'text', required: true, placeholder: 'e.g. Hazardous Materials' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Scope of products covered...' },
      { name: 'specialHandlingRequirements', label: 'Special Handling Requirements', type: 'textarea', placeholder: 'Specify certifications, escorts, temperature controls...' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'commodities',
    label: 'Commodities & HS Codes',
    icon: Tag,
    primaryKey: 'hsCode',
    description: 'Commodity definitions mapped to the Harmonized System custom classifications.',
    fields: [
      { name: 'hsCode', label: 'HS Code (6-Digit)', type: 'text', required: true, placeholder: 'e.g. 851712' },
      { name: 'commodityName', label: 'Commodity Name', type: 'text', required: true, placeholder: 'e.g. Smartphones & Mobile Phones' },
      { name: 'cargoTypeCode', label: 'Cargo Type', type: 'relation', relationKey: 'cargoTypes', relationValueField: 'cargoTypeCode', relationLabelField: 'cargoTypeName', required: true },
      { name: 'dutyRatePct', label: 'Est. Duty Rate (%)', type: 'number', required: true, placeholder: 'e.g. 10.0' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'packagingTypes',
    label: 'Packaging Types',
    icon: Package,
    primaryKey: 'packageCode',
    description: 'Unit structures used for cargo handling (pallets, boxes, drums).',
    fields: [
      { name: 'packageCode', label: 'Package Code', type: 'text', required: true, placeholder: 'e.g. PLT, BOX' },
      { name: 'packageName', label: 'Package Name', type: 'text', required: true, placeholder: 'e.g. Standard Euro Pallet' },
      { name: 'standardLengthCm', label: 'Standard Length (cm)', type: 'number', placeholder: 'e.g. 120' },
      { name: 'standardWidthCm', label: 'Standard Width (cm)', type: 'number', placeholder: 'e.g. 80' },
      { name: 'standardHeightCm', label: 'Standard Height (cm)', type: 'number', placeholder: 'e.g. 160' },
      { name: 'maxWeightKg', label: 'Max Capacity (kg)', type: 'number', placeholder: 'e.g. 1000' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'incoterms',
    label: 'Incoterms',
    icon: Scale,
    primaryKey: 'incotermCode',
    description: 'International Chamber of Commerce delivery rule definitions.',
    fields: [
      { name: 'incotermCode', label: 'Incoterm Code (ISO)', type: 'text', required: true, placeholder: 'e.g. FOB, CIF' },
      { name: 'incotermName', label: 'Incoterm Name', type: 'text', required: true, placeholder: 'e.g. Free On Board' },
      { name: 'responsibilities', label: 'Risk & Cost Allocation Responsibilities', type: 'textarea', placeholder: 'Describe risk transfers, shipping payments...' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'chargeHeads',
    label: 'Charge Heads',
    icon: DollarSign,
    primaryKey: 'chargeCode',
    description: 'Fee item catalogs mapped to freight base cost calculation structures.',
    fields: [
      { name: 'chargeCode', label: 'Charge Code', type: 'text', required: true, placeholder: 'e.g. OCF, BAF' },
      { name: 'chargeName', label: 'Charge Name', type: 'text', required: true, placeholder: 'e.g. Ocean Freight Base Rate' },
      { name: 'chargeType', label: 'Charge Category', type: 'select', required: true, options: ['Freight', 'Surcharge', 'Local Handling', 'Inland', 'Documentation', 'Customs', 'Duties'] },
      { name: 'defaultCurrency', label: 'Default Currency', type: 'relation', relationKey: 'currencies', relationValueField: 'currencyCode', relationLabelField: 'currencyName', required: true },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'currencies',
    label: 'Currencies & Rates',
    icon: Coins,
    primaryKey: 'currencyCode',
    description: 'System currency codes, conversion rates, and update trackers.',
    fields: [
      { name: 'currencyCode', label: 'Currency Code (3-Letter)', type: 'text', required: true, placeholder: 'e.g. USD, EUR' },
      { name: 'currencyName', label: 'Currency Name', type: 'text', required: true, placeholder: 'e.g. US Dollar' },
      { name: 'exchangeRateToUSD', label: 'Exchange Rate (1 USD = ?)', type: 'number', required: true, placeholder: 'e.g. 1.00 or 0.012' },
      { name: 'lastUpdated', label: 'Last Updated Date', type: 'text', placeholder: 'e.g. YYYY-MM-DD' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'rateCards',
    label: 'Rate Cards',
    icon: CreditCard,
    primaryKey: 'rateCardId',
    description: 'Pre-negotiated contract rates for carriers, lanes, and services.',
    fields: [
      { name: 'rateCardId', label: 'Rate Card ID', type: 'text', required: true, placeholder: 'e.g. RC-0001' },
      { name: 'carrierCode', label: 'Carrier', type: 'relation', relationKey: 'carriers', relationValueField: 'carrierCode', relationLabelField: 'carrierName', required: true },
      { name: 'laneCode', label: 'Trade Lane Code', type: 'relation', relationKey: 'tradeLanes', relationValueField: 'laneCode', relationLabelField: 'laneName', required: true },
      { name: 'serviceCode', label: 'Service Type Code', type: 'relation', relationKey: 'serviceTypes', relationValueField: 'serviceCode', relationLabelField: 'serviceName', required: true },
      { name: 'containerCode', label: 'Container Size (Optional)', type: 'text', placeholder: 'e.g. 20GP, 40HC, N/A' },
      { name: 'baseRate', label: 'Contract Base Rate', type: 'number', required: true, placeholder: 'e.g. 1200' },
      { name: 'currencyCode', label: 'Currency', type: 'relation', relationKey: 'currencies', relationValueField: 'currencyCode', relationLabelField: 'currencyName', required: true },
      { name: 'validFrom', label: 'Valid From (Date)', type: 'text', required: true, placeholder: 'e.g. YYYY-MM-DD' },
      { name: 'validTo', label: 'Valid To (Date)', type: 'text', required: true, placeholder: 'e.g. YYYY-MM-DD' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'surchargeRules',
    label: 'Surcharge Rules',
    icon: FileText,
    primaryKey: 'surchargeId',
    description: 'Fuel adjustments, peak season fees, and security surcharges.',
    fields: [
      { name: 'surchargeId', label: 'Surcharge ID', type: 'text', required: true, placeholder: 'e.g. SC-0001' },
      { name: 'surchargeName', label: 'Surcharge Name', type: 'text', required: true, placeholder: 'e.g. Peak Season Surcharge' },
      { name: 'chargeCode', label: 'Linked Charge Head', type: 'relation', relationKey: 'chargeHeads', relationValueField: 'chargeCode', relationLabelField: 'chargeName', required: true },
      { name: 'calculationMethod', label: 'Calculation Method', type: 'select', required: true, options: ['Flat Rate', 'Percentage'] },
      { name: 'value', label: 'Value (Rate or %)', type: 'number', required: true, placeholder: 'e.g. 250 or 8.5' },
      { name: 'currencyCode', label: 'Currency', type: 'relation', relationKey: 'currencies', relationValueField: 'currencyCode', relationLabelField: 'currencyName', required: true },
      { name: 'applicableModes', label: 'Modes (Comma separated)', type: 'text', placeholder: 'e.g. Ocean, Air' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'marginRules',
    label: 'Margin Rules',
    icon: TrendingUp,
    primaryKey: 'ruleId',
    description: 'Automated markup algorithms mapped by customer SLA categories.',
    fields: [
      { name: 'ruleId', label: 'Rule ID', type: 'text', required: true, placeholder: 'e.g. MR-0001' },
      { name: 'ruleName', label: 'Rule Description Name', type: 'text', required: true, placeholder: 'e.g. Retail Standard Markup' },
      { name: 'customerTier', label: 'Applicable Tier', type: 'select', required: true, options: ['Retail', 'Silver', 'Gold', 'Premium'] },
      { name: 'markupMethod', label: 'Markup Method', type: 'select', required: true, options: ['Percentage', 'Flat Rate'] },
      { name: 'markupValue', label: 'Markup Value', type: 'number', required: true, placeholder: 'e.g. 15 or 120' },
      { name: 'minMarginAmount', label: 'Min Profit Threshold', type: 'number', placeholder: 'e.g. 50' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'customsTariffs',
    label: 'Customs Tariffs',
    icon: Percent,
    primaryKey: 'tariffId',
    description: 'Border fees, customs duty rates, and tax policies mapped by HS code and origin.',
    fields: [
      { name: 'tariffId', label: 'Tariff Entry ID', type: 'text', required: true, placeholder: 'e.g. CT-0001' },
      { name: 'hsCode', label: 'Commodity HS Code', type: 'relation', relationKey: 'commodities', relationValueField: 'hsCode', relationLabelField: 'commodityName', required: true },
      { name: 'originCountryCode', label: 'Origin Country', type: 'relation', relationKey: 'countries', relationValueField: 'countryCode', relationLabelField: 'countryName', required: true },
      { name: 'destinationCountryCode', label: 'Destination Country', type: 'relation', relationKey: 'countries', relationValueField: 'countryCode', relationLabelField: 'countryName', required: true },
      { name: 'dutyRatePct', label: 'Customs Duty Rate (%)', type: 'number', required: true, placeholder: 'e.g. 20.0' },
      { name: 'additionalTaxPct', label: 'Additional Import Tax (%)', type: 'number', placeholder: 'e.g. 18.0' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  },
  {
    id: 'documentTypes',
    label: 'Document Types',
    icon: ClipboardList,
    primaryKey: 'documentCode',
    description: 'Documentation compliance standards required for customs/origin clearance.',
    fields: [
      { name: 'documentCode', label: 'Doc Code', type: 'text', required: true, placeholder: 'e.g. BOL, AWB' },
      { name: 'documentName', label: 'Document Name', type: 'text', required: true, placeholder: 'e.g. Bill of Lading' },
      { name: 'mandatoryForModes', label: 'Mandatory for Modes (Comma separated)', type: 'text', placeholder: 'e.g. Ocean, Rail' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Description of document purposes and requirements...' },
      { name: 'active', label: 'Active Status', type: 'boolean', defaultValue: true }
    ]
  }
];

export default function MasterData() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState('countries');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Entire DB storage in state
  const [datasets, setDatasets] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingItemKey, setEditingItemKey] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();

  // Load all datasets from DB service on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadedData = {};
    COLLECTIONS_CONFIG.forEach((col) => {
      loadedData[col.id] = db.getItems(col.id);
    });
    setDatasets(loadedData);
  }, [navigate]);

  const activeCol = COLLECTIONS_CONFIG.find((c) => c.id === activeCollectionId) || COLLECTIONS_CONFIG[0];
  const activeItems = datasets[activeCollectionId] || [];

  // Filter items based on search query
  const filteredItems = activeItems.filter((item) => {
    if (!searchQuery) return true;
    return Object.values(item).some(
      (val) => val && val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate high level stats for display
  const stats = {
    totalCollections: COLLECTIONS_CONFIG.length,
    totalRecords: Object.values(datasets).reduce((acc, curr) => acc + curr.length, 0),
    activeCount: Object.values(datasets).reduce(
      (acc, curr) => acc + curr.filter((i) => i.active).length,
      0
    ),
    inactiveCount: Object.values(datasets).reduce(
      (acc, curr) => acc + curr.filter((i) => !i.active).length,
      0
    )
  };

  // Toggle active/inactive status quickly from the table row
  const handleToggleActive = (item) => {
    const pkField = activeCol.primaryKey;
    const pkVal = item[pkField];
    const updatedStatus = !item.active;
    
    const updatedItems = db.updateItem(activeCol.id, pkField, pkVal, { active: updatedStatus });
    setDatasets((prev) => ({
      ...prev,
      [activeCol.id]: updatedItems
    }));
  };

  // Delete an item with user confirmation
  const handleDeleteItem = (item) => {
    const pkField = activeCol.primaryKey;
    const pkVal = item[pkField];
    if (window.confirm(`Are you sure you want to delete this record (${pkVal})?`)) {
      const updatedItems = db.deleteItem(activeCol.id, pkField, pkVal);
      setDatasets((prev) => ({
        ...prev,
        [activeCol.id]: updatedItems
      }));
    }
  };

  // Open modal in edit mode
  const handleEditClick = (item) => {
    const pkField = activeCol.primaryKey;
    setEditingItemKey(item[pkField]);
    setModalMode('edit');
    setFormData(item);
    setFormErrors({});
    setShowModal(true);
  };

  // Open modal in add mode
  const handleAddClick = () => {
    setEditingItemKey(null);
    setModalMode('add');
    
    // Set default values (e.g. active = true)
    const defaults = {};
    activeCol.fields.forEach(f => {
      if (f.defaultValue !== undefined) {
        defaults[f.name] = f.defaultValue;
      } else if (f.type === 'boolean') {
        defaults[f.name] = false;
      } else if (f.type === 'number') {
        defaults[f.name] = '';
      } else {
        defaults[f.name] = '';
      }
    });

    setFormData(defaults);
    setFormErrors({});
    setShowModal(true);
  };

  // Handle form field change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field.name]: field.type === 'number' ? (value !== '' ? Number(value) : '') : value
    }));

    // Clear validation error on type
    if (formErrors[field.name]) {
      setFormErrors((prev) => ({
        ...prev,
        [field.name]: null
      }));
    }
  };

  // Save the record
  const handleSaveItem = (e) => {
    e.preventDefault();
    
    // Simple Validation
    const errors = {};
    activeCol.fields.forEach((field) => {
      if (field.required && (formData[field.name] === undefined || formData[field.name] === '')) {
        errors[field.name] = `${field.label} is required`;
      }
    });

    // Check duplicate primary keys in Add mode
    const pkField = activeCol.primaryKey;
    if (modalMode === 'add') {
      const isDuplicate = activeItems.some(item => item[pkField]?.toString().toLowerCase() === formData[pkField]?.toString().toLowerCase());
      if (isDuplicate) {
        errors[pkField] = `A record with this ${activeCol.fields.find(f => f.name === pkField)?.label || pkField} already exists.`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    let updatedList;
    if (modalMode === 'add') {
      updatedList = db.addItem(activeCol.id, formData);
    } else {
      updatedList = db.updateItem(activeCol.id, pkField, editingItemKey, formData);
    }

    setDatasets((prev) => ({
      ...prev,
      [activeCol.id]: updatedList
    }));
    setShowModal(false);
  };

  // Resolve relationship options dynamically
  const getRelationOptions = (field) => {
    const relationData = datasets[field.relationKey] || [];
    // Only display active items in dropdown, but include current editing value in case it is inactive
    return relationData.filter(item => item.active || item[field.relationValueField] === formData[field.name]);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Dashboard Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">

          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                Master Data Administration
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1">
                Maintain standard lookup codes, pricing indices, and policy controls mapping FreightQuote AI rules.
              </p>
            </div>
            
            {/* Quick stats indicator */}
            <div className="flex items-center gap-2 md:gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm glass shrink-0">
              <div className="px-3 border-r border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Collections</p>
                <p className="text-base font-extrabold text-blue-600">{stats.totalCollections}</p>
              </div>
              <div className="px-3 border-r border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Records</p>
                <p className="text-base font-extrabold text-slate-700">{stats.totalRecords}</p>
              </div>
              <div className="px-3 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Items</p>
                <p className="text-base font-extrabold text-emerald-600">{stats.activeCount}</p>
              </div>
            </div>
          </div>

          {/* Master Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Nav Pane - Collections Selection */}
            <div className="lg:col-span-1 flex flex-col gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase px-2 mb-1">
                Data Tables ({COLLECTIONS_CONFIG.length})
              </span>
              
              {/* Mobile selector */}
              <div className="block lg:hidden w-full relative">
                <select
                  value={activeCollectionId}
                  onChange={(e) => {
                    setActiveCollectionId(e.target.value);
                    setSearchQuery('');
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {COLLECTIONS_CONFIG.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.label} ({datasets[col.id]?.length || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop vertical tab items */}
              <div className="hidden lg:flex flex-col bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-sm max-h-[640px] overflow-y-auto space-y-1">
                {COLLECTIONS_CONFIG.map((col) => {
                  const Icon = col.icon;
                  const isActive = col.id === activeCollectionId;
                  const count = datasets[col.id]?.length || 0;
                  
                  return (
                    <button
                      key={col.id}
                      onClick={() => {
                        setActiveCollectionId(col.id);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className="truncate">{col.label}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Pane - Active Table Workspace */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              
              {/* Collection Intro Card */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600 border border-blue-100/60">
                      <activeCol.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">{activeCol.label}</h2>
                      <p className="text-slate-500 text-[11px] md:text-xs mt-0.5">{activeCol.description}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAddClick}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/10 shrink-0 self-start sm:self-center"
                >
                  <Plus className="w-4 h-4" />
                  Add {activeCol.label.replace(/s$/, '')}
                </button>
              </div>

              {/* Data controls & table card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                
                {/* Search Bar & Filtering */}
                <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={`Search records in ${activeCol.label}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-250/70 hover:border-slate-350 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold shadow-xs focus:outline-none transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  
                  {filteredItems.length !== activeItems.length && (
                    <span className="text-[10px] font-bold text-slate-500 ml-3">
                      Found {filteredItems.length} of {activeItems.length} records
                    </span>
                  )}
                </div>

                {/* Table container */}
                <div className="overflow-x-auto min-h-[300px]">
                  {filteredItems.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 tracking-wider uppercase">
                          {activeCol.fields.map((field) => (
                            <th key={field.name} className="px-5 py-3.5 font-bold">
                              {field.label}
                            </th>
                          ))}
                          <th className="px-5 py-3.5 text-right font-bold w-32">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                        {filteredItems.map((item, rowIndex) => {
                          const pkVal = item[activeCol.primaryKey];
                          
                          return (
                            <tr key={pkVal || rowIndex} className="hover:bg-slate-50/50 transition-colors">
                              {activeCol.fields.map((field) => {
                                const val = item[field.name];
                                
                                return (
                                  <td key={field.name} className="px-5 py-3.5 max-w-[240px] truncate">
                                    {field.type === 'boolean' ? (
                                      <button
                                        onClick={() => handleToggleActive(item)}
                                        className={`px-2.5 py-1 rounded-full text-[9px] font-black border transition-all cursor-pointer ${
                                          val
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-rose-50 text-rose-700 border-rose-250'
                                        }`}
                                      >
                                        {val ? 'Active' : 'Inactive'}
                                      </button>
                                    ) : field.type === 'relation' ? (
                                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                        {val || <span className="text-slate-400 italic">none</span>}
                                      </span>
                                    ) : field.name === activeCol.primaryKey ? (
                                      <span className="font-extrabold text-slate-900 bg-blue-50/50 border border-blue-100/50 px-2 py-0.5 rounded-md text-[10px]">
                                        {val}
                                      </span>
                                    ) : (
                                      <span className="text-slate-650">{val?.toString() ?? '-'}</span>
                                    )}
                                  </td>
                                );
                              })}
                              
                              {/* Actions columns */}
                              <td className="px-5 py-3.5 text-right">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <button
                                    onClick={() => handleEditClick(item)}
                                    title="Edit record"
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100/40 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item)}
                                    title="Delete record"
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100/40 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-black text-slate-800">No Records Found</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        There are no reference items matching your filters. Add a new item to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dynamic Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden relative z-55 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                    <activeCol.icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">
                      {modalMode === 'add' ? 'Add New' : 'Edit'} {activeCol.label.replace(/s$/, '')}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Please populate the fields required for validation.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeCol.fields.map((field) => {
                  const error = formErrors[field.name];
                  const isPk = field.name === activeCol.primaryKey;
                  const isEdit = modalMode === 'edit';

                  return (
                    <div key={field.name} className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-rose-500 font-extrabold">*</span>}
                      </label>
                      
                      {field.type === 'boolean' ? (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleInputChange(field, !formData[field.name])}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                              formData[field.name] ? 'bg-blue-600' : 'bg-slate-200'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                                formData[field.name] ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className="text-xs font-semibold text-slate-600">
                            {formData[field.name] ? 'Active (Visible/Usable)' : 'Inactive (Archived/Hidden)'}
                          </span>
                        </div>
                      ) : field.type === 'select' ? (
                        <select
                          value={formData[field.name] ?? ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          disabled={isPk && isEdit}
                          className="w-full bg-white border border-slate-250 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="">Select option...</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'relation' ? (
                        <select
                          value={formData[field.name] ?? ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          disabled={isPk && isEdit}
                          className="w-full bg-white border border-slate-250 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="">Select related code...</option>
                          {getRelationOptions(field).map((opt) => {
                            const val = opt[field.relationValueField];
                            const labelStr = opt[field.relationLabelField] || opt[field.relationValueField];
                            return (
                              <option key={val} value={val}>
                                {val} — {labelStr}
                              </option>
                            );
                          })}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          placeholder={field.placeholder}
                          value={formData[field.name] ?? ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          disabled={isPk && isEdit}
                          rows={3}
                          className="w-full bg-white border border-slate-250 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 resize-y"
                        />
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          placeholder={field.placeholder}
                          value={formData[field.name] ?? ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          disabled={isPk && isEdit}
                          className="w-full bg-white border border-slate-250 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      )}

                      {error && (
                        <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {error}
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-600/10"
                  >
                    <Check className="w-4 h-4" />
                    Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
