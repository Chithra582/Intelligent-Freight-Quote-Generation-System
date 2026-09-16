from django.db import models


class UserRole(models.TextChoices):
    CUSTOMER = 'CUSTOMER', 'Customer / Shipper'
    FREIGHT_AGENT = 'FREIGHT_AGENT', 'Freight Agent / Operations'
    CUSTOMS_OFFICER = 'CUSTOMS_OFFICER', 'Customs Officer'
    BROKER = 'BROKER', 'Freight Broker'
    SENIOR_BROKER = 'SENIOR_BROKER', 'Senior Broker'
    PRICING_MANAGER = 'PRICING_MANAGER', 'Pricing Manager'
    OPERATIONS = 'OPERATIONS', 'Operations Lead'
    COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER', 'Compliance Officer'
    EXECUTIVE = 'EXECUTIVE', 'Executive Management'
    COMPANY_MANAGER = 'COMPANY_MANAGER', 'Freight Company Manager'
    COMPANY_AGENT = 'COMPANY_AGENT', 'Company Verification Agent'
    ADMIN = 'ADMIN', 'System Administrator'


class TransportMode(models.TextChoices):
    OCEAN = 'OCEAN', 'Ocean Freight'
    AIR = 'AIR', 'Air Freight'
    GROUND_RAIL = 'GROUND_RAIL', 'Ground & Rail Freight'
    EXPRESS_AIR = 'EXPRESS_AIR', 'Express Air Courier'


class LoadType(models.TextChoices):
    FCL = 'FCL', 'Full Container Load'
    LCL = 'LCL', 'Less than Container Load'


class Incoterm(models.TextChoices):
    EXW = 'EXW', 'Ex Works'
    FCA = 'FCA', 'Free Carrier'
    FOB = 'FOB', 'Free On Board'
    CIF = 'CIF', 'Cost, Insurance and Freight'
    CFR = 'CFR', 'Cost and Freight'
    DAP = 'DAP', 'Delivered At Place'
    DDP = 'DDP', 'Delivered Duty Paid'


class PackageType(models.TextChoices):
    CONTAINER = 'CONTAINER', 'Shipping Container'
    PALLET = 'PALLET', 'Standard Pallet'
    CARTON = 'CARTON', 'Corrugated Carton / Box'
    CRATE = 'CRATE', 'Heavy Wooden Crate'
    DRUM = 'DRUM', 'Steel / Plastic Drum'
    BAG = 'BAG', 'Industrial Sack / Bag'
    LOOSE = 'LOOSE', 'Loose / Breakbulk Cargo'


class ContainerTypeCode(models.TextChoices):
    GP20 = '20GP', "20' General Purpose"
    GP40 = '40GP', "40' General Purpose"
    HC40 = '40HC', "40' High Cube"
    RF20 = '20RF', "20' Reefer Temperature Controlled"
    RF40 = '40RF', "40' Reefer Temperature Controlled"
    OT20 = '20OT', "20' Open Top"
    FR40 = '40FR', "40' Flat Rack"


class ShipmentStatus(models.TextChoices):
    ENQUIRY = 'ENQUIRY', 'Enquiry Created'
    QUOTING = 'QUOTING', 'Quoting in Progress'
    QUOTED = 'QUOTED', 'Quoted'
    QUOTE_FAILED = 'QUOTE_FAILED', 'Quote Generation Failed'
    WON = 'WON', 'Deal Won'
    LOST = 'LOST', 'Deal Lost'
    EXPIRED = 'EXPIRED', 'Enquiry Expired'
    CANCELLED = 'CANCELLED', 'Enquiry Cancelled'


class QuoteStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft Quote'
    PENDING_APPROVAL = 'PENDING_APPROVAL', 'Pending Manager Approval'
    APPROVED = 'APPROVED', 'Approved by Authority'
    REJECTED = 'REJECTED', 'Rejected by Approver'
    ISSUED = 'ISSUED', 'Issued to Customer'
    ACCEPTED = 'ACCEPTED', 'Accepted by Customer'
    DECLINED = 'DECLINED', 'Declined by Customer'
    EXPIRED = 'EXPIRED', 'Validity Expired'
    SUPERSEDED = 'SUPERSEDED', 'Superseded by New Version'


class SurchargeCode(models.TextChoices):
    BAF = 'BAF', 'Bunker Adjustment Factor (Fuel)'
    CAF = 'CAF', 'Currency Adjustment Factor'
    THC = 'THC', 'Terminal Handling Charge'
    ISPS = 'ISPS', 'International Ship & Port Security'
    PSS = 'PSS', 'Peak Season Surcharge'
    LSS = 'LSS', 'Low Sulphur Surcharge'
    DOC = 'DOC', 'Documentation & BL Fee'
    IHC = 'IHC', 'Inland Haulage Charge'
    SEC = 'SEC', 'Security & Compliance Surcharge'


class CalculationType(models.TextChoices):
    FLAT = 'FLAT', 'Flat Fixed Fee'
    PER_CONTAINER = 'PER_CONTAINER', 'Rate Per Container'
    PERCENT = 'PERCENT', 'Percentage of Base Freight'
    PER_KG = 'PER_KG', 'Rate Per Kilogram'
    PER_RT = 'PER_RT', 'Rate Per Revenue Ton'


class CustomerTier(models.TextChoices):
    STRATEGIC = 'STRATEGIC', 'Strategic Enterprise Partner'
    KEY = 'KEY', 'Key Commercial Account'
    STANDARD = 'STANDARD', 'Standard Commercial Shipper'
    NEW = 'NEW', 'New Prospect Account'


class MarginPolicyScope(models.TextChoices):
    GLOBAL = 'GLOBAL', 'Global Default Policy'
    LANE = 'LANE', 'Trade Lane Specific Policy'
    CUSTOMER_TIER = 'CUSTOMER_TIER', 'Customer Tier Specific Policy'
    CARGO_TYPE = 'CARGO_TYPE', 'Cargo Type Specific Policy'


class M4WorkflowStatus(models.TextChoices):
    QUOTE_OPTIONS_AVAILABLE = 'QUOTE_OPTIONS_AVAILABLE', 'Options Ready'
    QUOTE_SELECTED = 'QUOTE_SELECTED', 'Customer Selected Quote'
    PENDING_COMPANY_VERIFICATION = 'PENDING_COMPANY_VERIFICATION', 'Pending Company Verification'
    UNDER_VERIFICATION = 'UNDER_VERIFICATION', 'Under Agent Verification'
    AWAITING_CUSTOMER_INFO = 'AWAITING_CUSTOMER_INFO', 'Awaiting Customer Info'
    REVISION_PENDING_CUSTOMER = 'REVISION_PENDING_CUSTOMER', 'Revision Pending Customer Review'
    APPROVED = 'APPROVED', 'Company Approved'
    PENDING_CUSTOMS_APPROVAL = 'PENDING_CUSTOMS_APPROVAL', 'Pending Customs Clearance'
    CUSTOMS_APPROVED = 'CUSTOMS_APPROVED', 'Customs Clearance Granted'
    VERIFIED_PENDING_CUSTOMER = 'VERIFIED_PENDING_CUSTOMER', 'Verified & Cleared - Pending Customer Confirmation'
    REJECTED = 'REJECTED', 'Company Rejected'
    CUSTOMER_REJECTED = 'CUSTOMER_REJECTED', 'Customer Rejected'
    REVISION_ACCEPTED = 'REVISION_ACCEPTED', 'Customer Accepted Revision'
    BOOKING_CONFIRMED = 'BOOKING_CONFIRMED', 'Booking Confirmed'
    BOOKING_CANCELLED = 'BOOKING_CANCELLED', 'Booking Cancelled'
    RESELECT_QUOTE = 'RESELECT_QUOTE', 'Customer Reselect Quote'

