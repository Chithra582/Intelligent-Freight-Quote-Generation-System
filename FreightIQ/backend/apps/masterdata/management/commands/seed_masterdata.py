from decimal import Decimal
from datetime import date
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import Organization
from apps.masterdata.models import (
    Country, Port, Airport, PortDistance, Carrier,
    CarrierService, ContainerType, Commodity, Currency, FxRate, BusinessCalendar
)
from calc.distance import PORT_DISTANCES_TABLE
from core.enums import UserRole

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds complete reference master data for FreightIQ (Milestones 1 & 2)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding FreightIQ master data...'))

        # 1. Countries
        countries_data = [
            {'code': 'IN', 'name': 'India', 'region': 'APAC', 'currency_code': 'INR'},
            {'code': 'US', 'name': 'United States', 'region': 'AMER', 'currency_code': 'USD'},
            {'code': 'AE', 'name': 'United Arab Emirates', 'region': 'MEASA', 'currency_code': 'AED'},
            {'code': 'DE', 'name': 'Germany', 'region': 'EMEA', 'currency_code': 'EUR'},
            {'code': 'NL', 'name': 'Netherlands', 'region': 'EMEA', 'currency_code': 'EUR'},
            {'code': 'CN', 'name': 'China', 'region': 'APAC', 'currency_code': 'CNY'},
            {'code': 'SG', 'name': 'Singapore', 'region': 'APAC', 'currency_code': 'SGD'},
            {'code': 'KR', 'name': 'South Korea', 'region': 'APAC', 'currency_code': 'KRW'},
            {'code': 'JP', 'name': 'Japan', 'region': 'APAC', 'currency_code': 'JPY'},
            {'code': 'GB', 'name': 'United Kingdom', 'region': 'EMEA', 'currency_code': 'GBP'},
            {'code': 'SA', 'name': 'Saudi Arabia', 'region': 'MEASA', 'currency_code': 'SAR'},
            {'code': 'LK', 'name': 'Sri Lanka', 'region': 'APAC', 'currency_code': 'LKR'},
        ]
        for c in countries_data:
            Country.objects.update_or_create(code=c['code'], defaults=c)
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(countries_data)} countries.'))

        # 2. Currencies
        currencies_data = [
            {'code': 'USD', 'name': 'US Dollar', 'symbol': '$'},
            {'code': 'INR', 'name': 'Indian Rupee', 'symbol': '₹'},
            {'code': 'EUR', 'name': 'Euro', 'symbol': '€'},
            {'code': 'AED', 'name': 'UAE Dirham', 'symbol': 'AED'},
            {'code': 'CNY', 'name': 'Chinese Yuan', 'symbol': '¥'},
            {'code': 'GBP', 'name': 'British Pound', 'symbol': '£'},
            {'code': 'SGD', 'name': 'Singapore Dollar', 'symbol': 'S$'},
            {'code': 'LKR', 'name': 'Sri Lankan Rupee', 'symbol': 'Rs'},
        ]
        for curr in currencies_data:
            Currency.objects.update_or_create(code=curr['code'], defaults=curr)
        self.stdout.write(self.style.SUCCESS('Seeded Currencies.'))

        # 3. FX Rates (Base USD)
        usd = Currency.objects.get(code='USD')
        fx_data = [
            ('INR', Decimal('83.500000')),
            ('EUR', Decimal('0.920000')),
            ('AED', Decimal('3.672500')),
            ('CNY', Decimal('7.240000')),
            ('GBP', Decimal('0.785000')),
            ('SGD', Decimal('1.345000')),
            ('LKR', Decimal('305.000000')),
        ]
        for curr_code, rate_to_usd in fx_data:
            target_curr = Currency.objects.get(code=curr_code)
            FxRate.objects.update_or_create(
                from_currency=usd,
                to_currency=target_curr,
                defaults={'rate': rate_to_usd}
            )
            # Invert
            FxRate.objects.update_or_create(
                from_currency=target_curr,
                to_currency=usd,
                defaults={'rate': Decimal('1.0') / rate_to_usd}
            )

        # 4. Container Types
        containers = [
            {'code': '20GP', 'name': "20' General Purpose", 'length_ft': 20, 'width_ft': 8, 'height_ft': 8.5, 'max_payload_kg': 28200, 'tare_weight_kg': 2300, 'internal_cbm': 33.2, 'is_reefer': False},
            {'code': '40GP', 'name': "40' General Purpose", 'length_ft': 40, 'width_ft': 8, 'height_ft': 8.5, 'max_payload_kg': 28800, 'tare_weight_kg': 3700, 'internal_cbm': 67.7, 'is_reefer': False},
            {'code': '40HC', 'name': "40' High Cube", 'length_ft': 40, 'width_ft': 8, 'height_ft': 9.5, 'max_payload_kg': 28600, 'tare_weight_kg': 3950, 'internal_cbm': 76.3, 'is_reefer': False},
            {'code': '20RF', 'name': "20' Refrigerated Reefer", 'length_ft': 20, 'width_ft': 8, 'height_ft': 8.5, 'max_payload_kg': 27400, 'tare_weight_kg': 3050, 'internal_cbm': 28.3, 'is_reefer': True},
            {'code': '40RF', 'name': "40' Refrigerated Reefer", 'length_ft': 40, 'width_ft': 8, 'height_ft': 9.5, 'max_payload_kg': 29400, 'tare_weight_kg': 4380, 'internal_cbm': 67.5, 'is_reefer': True},
            {'code': '20OT', 'name': "20' Open Top", 'length_ft': 20, 'width_ft': 8, 'height_ft': 8.5, 'max_payload_kg': 28000, 'tare_weight_kg': 2350, 'internal_cbm': 32.5, 'is_reefer': False},
            {'code': '40FR', 'name': "40' Flat Rack", 'length_ft': 40, 'width_ft': 8, 'height_ft': 8.5, 'max_payload_kg': 45000, 'tare_weight_kg': 5000, 'internal_cbm': 0.0, 'is_reefer': False},
        ]
        for c_item in containers:
            ContainerType.objects.update_or_create(code=c_item['code'], defaults=c_item)

        # 5. Ports (UN/LOCODE)
        ports_data = [
            {'un_locode': 'INNSA', 'name': 'Nhava Sheva (Jawaharlal Nehru Port)', 'city': 'Navi Mumbai', 'country_id': 'IN', 'latitude': 18.9500, 'longitude': 72.9500, 'timezone': 'Asia/Kolkata', 'is_transhipment_hub': False, 'supported_modes': ['OCEAN', 'GROUND_RAIL']},
            {'un_locode': 'INMUN', 'name': 'Mundra Port', 'city': 'Mundra', 'country_id': 'IN', 'latitude': 22.8400, 'longitude': 69.7000, 'timezone': 'Asia/Kolkata', 'is_transhipment_hub': False, 'supported_modes': ['OCEAN', 'GROUND_RAIL']},
            {'un_locode': 'INMAA', 'name': 'Chennai Port', 'city': 'Chennai', 'country_id': 'IN', 'latitude': 13.0827, 'longitude': 80.2707, 'timezone': 'Asia/Kolkata', 'is_transhipment_hub': False, 'supported_modes': ['OCEAN', 'GROUND_RAIL']},
            {'un_locode': 'INCCU', 'name': 'Kolkata Syama Prasad Mookerjee Port', 'city': 'Kolkata', 'country_id': 'IN', 'latitude': 22.5726, 'longitude': 88.3639, 'timezone': 'Asia/Kolkata', 'is_transhipment_hub': False, 'supported_modes': ['OCEAN', 'GROUND_RAIL']},
            {'un_locode': 'INCOK', 'name': 'Cochin Port (Vallarpadam)', 'city': 'Kochi', 'country_id': 'IN', 'latitude': 9.9312, 'longitude': 76.2673, 'timezone': 'Asia/Kolkata', 'is_transhipment_hub': True, 'supported_modes': ['OCEAN', 'GROUND_RAIL']},
            {'un_locode': 'LKCMB', 'name': 'Port of Colombo', 'city': 'Colombo', 'country_id': 'LK', 'latitude': 6.9497, 'longitude': 79.8456, 'timezone': 'Asia/Colombo', 'is_transhipment_hub': True, 'supported_modes': ['OCEAN']},
            {'un_locode': 'AEJEA', 'name': 'Jebel Ali Port (DP World)', 'city': 'Dubai', 'country_id': 'AE', 'latitude': 25.0112, 'longitude': 55.0617, 'timezone': 'Asia/Dubai', 'is_transhipment_hub': True, 'supported_modes': ['OCEAN', 'GROUND_RAIL']},
            {'un_locode': 'CNSHA', 'name': 'Port of Shanghai (Yangshan)', 'city': 'Shanghai', 'country_id': 'CN', 'latitude': 31.2243, 'longitude': 121.4691, 'timezone': 'Asia/Shanghai', 'is_transhipment_hub': True, 'supported_modes': ['OCEAN', 'GROUND_RAIL']},
            {'un_locode': 'CNSHK', 'name': 'Port of Shekou (Shenzhen)', 'city': 'Shenzhen', 'country_id': 'CN', 'latitude': 22.4833, 'longitude': 113.9167, 'timezone': 'Asia/Shanghai', 'is_transhipment_hub': True, 'supported_modes': ['OCEAN', 'GROUND_RAIL']},
            {'un_locode': 'HKHKG', 'name': 'Port of Hong Kong (Kwai Tsing)', 'city': 'Hong Kong', 'country_id': 'CN', 'latitude': 22.3193, 'longitude': 114.1694, 'timezone': 'Asia/Hong_Kong', 'is_transhipment_hub': True, 'supported_modes': ['OCEAN']},
            {'un_locode': 'SGSIN', 'name': 'Port of Singapore (PSA)', 'city': 'Singapore', 'country_id': 'SG', 'latitude': 1.2902, 'longitude': 103.8519, 'timezone': 'Asia/Singapore', 'is_transhipment_hub': True, 'supported_modes': ['OCEAN']},
            {'un_locode': 'NLRTM', 'name': 'Port of Rotterdam', 'city': 'Rotterdam', 'country_id': 'NL', 'latitude': 51.9244, 'longitude': 4.4777, 'timezone': 'Europe/Amsterdam', 'is_transhipment_hub': True, 'supported_modes': ['OCEAN', 'GROUND_RAIL']},
            {'un_locode': 'DEHAM', 'name': 'Port of Hamburg', 'city': 'Hamburg', 'country_id': 'DE', 'latitude': 53.5458, 'longitude': 9.9644, 'timezone': 'Europe/Berlin', 'is_transhipment_hub': True, 'supported_modes': ['OCEAN', 'GROUND_RAIL']},
            {'un_locode': 'USLAX', 'name': 'Port of Los Angeles', 'city': 'Los Angeles', 'country_id': 'US', 'latitude': 33.7288, 'longitude': -118.2620, 'timezone': 'America/Los_Angeles', 'is_transhipment_hub': True, 'supported_modes': ['OCEAN', 'GROUND_RAIL']},
            {'un_locode': 'USNYC', 'name': 'Port of New York & New Jersey', 'city': 'New York', 'country_id': 'US', 'latitude': 40.6698, 'longitude': -74.1500, 'timezone': 'America/New_York', 'is_transhipment_hub': True, 'supported_modes': ['OCEAN', 'GROUND_RAIL']},
            {'un_locode': 'KRPUS', 'name': 'Port of Busan', 'city': 'Busan', 'country_id': 'KR', 'latitude': 35.1028, 'longitude': 129.0403, 'timezone': 'Asia/Seoul', 'is_transhipment_hub': True, 'supported_modes': ['OCEAN']},
            {'un_locode': 'JPYOK', 'name': 'Port of Yokohama', 'city': 'Yokohama', 'country_id': 'JP', 'latitude': 35.4437, 'longitude': 139.6380, 'timezone': 'Asia/Tokyo', 'is_transhipment_hub': False, 'supported_modes': ['OCEAN']},
        ]
        port_objs = {}
        for p in ports_data:
            port_obj, _ = Port.objects.update_or_create(un_locode=p['un_locode'], defaults=p)
            port_objs[p['un_locode']] = port_obj
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(ports_data)} Sea Ports.'))

        # 6. Seed Port Distances
        for (f_code, t_code), nm_dist in PORT_DISTANCES_TABLE.items():
            if f_code in port_objs and t_code in port_objs:
                PortDistance.objects.update_or_create(
                    from_port=port_objs[f_code],
                    to_port=port_objs[t_code],
                    defaults={
                        'nautical_miles': nm_dist,
                        'corridor_via': 'Suez' if 'NLRTM' in (f_code, t_code) or 'DEHAM' in (f_code, t_code) else 'Pacific/Malacca'
                    }
                )
        self.stdout.write(self.style.SUCCESS(f'Seeded Port Distances.'))

        # 7. Cargo Airports (IATA)
        airports_data = [
            {'iata_code': 'BOM', 'name': 'Chhatrapati Shivaji Maharaj International Airport', 'city': 'Mumbai', 'country_id': 'IN', 'latitude': 19.0896, 'longitude': 72.8656, 'timezone': 'Asia/Kolkata'},
            {'iata_code': 'DEL', 'name': 'Indira Gandhi International Airport', 'city': 'New Delhi', 'country_id': 'IN', 'latitude': 28.5562, 'longitude': 77.1000, 'timezone': 'Asia/Kolkata'},
            {'iata_code': 'DXB', 'name': 'Dubai International Airport', 'city': 'Dubai', 'country_id': 'AE', 'latitude': 25.2532, 'longitude': 55.3657, 'timezone': 'Asia/Dubai'},
            {'iata_code': 'PVG', 'name': 'Shanghai Pudong International Airport', 'city': 'Shanghai', 'country_id': 'CN', 'latitude': 31.1443, 'longitude': 121.8083, 'timezone': 'Asia/Shanghai'},
            {'iata_code': 'SIN', 'name': 'Singapore Changi Airport', 'city': 'Singapore', 'country_id': 'SG', 'latitude': 1.3644, 'longitude': 103.9915, 'timezone': 'Asia/Singapore'},
            {'iata_code': 'FRA', 'name': 'Frankfurt Airport CargoCity', 'city': 'Frankfurt', 'country_id': 'DE', 'latitude': 50.0379, 'longitude': 8.5622, 'timezone': 'Europe/Berlin'},
            {'iata_code': 'AMS', 'name': 'Amsterdam Airport Schiphol', 'city': 'Amsterdam', 'country_id': 'NL', 'latitude': 52.3105, 'longitude': 4.7683, 'timezone': 'Europe/Amsterdam'},
            {'iata_code': 'LAX', 'name': 'Los Angeles International Airport', 'city': 'Los Angeles', 'country_id': 'US', 'latitude': 33.9416, 'longitude': -118.4085, 'timezone': 'America/Los_Angeles'},
            {'iata_code': 'JFK', 'name': 'John F. Kennedy International Airport', 'city': 'New York', 'country_id': 'US', 'latitude': 40.6413, 'longitude': -73.7781, 'timezone': 'America/New_York'},
            {'iata_code': 'HKG', 'name': 'Hong Kong International Airport', 'city': 'Hong Kong', 'country_id': 'CN', 'latitude': 22.3080, 'longitude': 113.9185, 'timezone': 'Asia/Hong_Kong'},
            {'iata_code': 'LHR', 'name': 'London Heathrow Airport', 'city': 'London', 'country_id': 'GB', 'latitude': 51.4700, 'longitude': -0.4543, 'timezone': 'Europe/London'},
        ]
        for a in airports_data:
            Airport.objects.update_or_create(iata_code=a['iata_code'], defaults=a)
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(airports_data)} Cargo Airports.'))

        # 8. Carriers & Services
        carriers_data = [
            {'code': 'ABC', 'name': 'ABC Shipping', 'service_type': 'Ocean', 'reliability_score': 95.0, 'on_time_pct': 92.0},
            {'code': 'XYZ', 'name': 'XYZ Shipping', 'service_type': 'Ocean', 'reliability_score': 91.0, 'on_time_pct': 88.0},
            {'code': 'MSK', 'name': 'Maersk Line', 'service_type': 'Ocean', 'reliability_score': 94.2, 'on_time_pct': 91.5},
            {'code': 'MSC', 'name': 'Mediterranean Shipping Company (MSC)', 'service_type': 'Ocean', 'reliability_score': 92.0, 'on_time_pct': 88.4},
            {'code': 'CMA', 'name': 'CMA CGM Group', 'service_type': 'Ocean', 'reliability_score': 90.5, 'on_time_pct': 87.0},
            {'code': 'COSCO', 'name': 'COSCO Shipping Lines', 'service_type': 'Ocean', 'reliability_score': 89.0, 'on_time_pct': 85.5},
            {'code': 'HLD', 'name': 'Hapag-Lloyd', 'service_type': 'Ocean', 'reliability_score': 93.0, 'on_time_pct': 90.0},
            {'code': 'ONE', 'name': 'Ocean Network Express (ONE)', 'service_type': 'Ocean', 'reliability_score': 88.5, 'on_time_pct': 86.0},
            {'code': 'FDX', 'name': 'FedEx Express Cargo', 'service_type': 'Air', 'reliability_score': 98.0, 'on_time_pct': 96.5},
            {'code': 'EK', 'name': 'Emirates SkyCargo', 'service_type': 'Air', 'reliability_score': 96.5, 'on_time_pct': 94.0},
            {'code': 'LH', 'name': 'Lufthansa Cargo', 'service_type': 'Air', 'reliability_score': 95.0, 'on_time_pct': 92.5},
            {'code': 'QR', 'name': 'Qatar Airways Cargo', 'service_type': 'Air', 'reliability_score': 96.0, 'on_time_pct': 93.5},
        ]
        carrier_objs = {}
        for cr in carriers_data:
            c_obj, _ = Carrier.objects.update_or_create(code=cr['code'], defaults=cr)
            carrier_objs[cr['code']] = c_obj

        # Carrier Services (port rotations)
        services_data = [
            {'carrier': 'ABC', 'service_name': 'Chennai Singapore Direct Express', 'port_rotation': ['INMAA', 'SGSIN'], 'frequency_days': 7, 'sailings_per_week': 2.0, 'transit_days': 6},
            {'carrier': 'XYZ', 'service_name': 'Chennai Arabian Gulf Express', 'port_rotation': ['INMAA', 'AEJEA'], 'frequency_days': 7, 'sailings_per_week': 2.0, 'transit_days': 9},
            {'carrier': 'MSK', 'service_name': 'Bay of Bengal Colombo Feeder', 'port_rotation': ['INMAA', 'LKCMB', 'SGSIN'], 'frequency_days': 7, 'sailings_per_week': 2.0, 'transit_days': 8},
            {'carrier': 'MSK', 'service_name': 'MECL1 - Middle East India Europe Loop', 'port_rotation': ['INNSA', 'INMUN', 'AEJEA', 'NLRTM', 'DEHAM'], 'frequency_days': 7, 'sailings_per_week': 2.0, 'transit_days': 19},
            {'carrier': 'MSK', 'service_name': 'AE1 - Asia Europe Express', 'port_rotation': ['CNSHA', 'HKHKG', 'SGSIN', 'NLRTM', 'DEHAM'], 'frequency_days': 7, 'sailings_per_week': 2.0, 'transit_days': 24},
            {'carrier': 'MSK', 'service_name': 'TP1 - Transpacific Southern Express', 'port_rotation': ['CNSHA', 'KRPUS', 'USLAX'], 'frequency_days': 7, 'sailings_per_week': 3.0, 'transit_days': 13},
            {'carrier': 'COSCO', 'service_name': 'AWE2 - Asia US East Coast Express', 'port_rotation': ['CNSHA', 'SGSIN', 'AEJEA', 'USNYC'], 'frequency_days': 7, 'sailings_per_week': 1.5, 'transit_days': 28},
            {'carrier': 'COSCO', 'service_name': 'CPX - China Pacific Express', 'port_rotation': ['CNSHA', 'CNSHK', 'USLAX'], 'frequency_days': 7, 'sailings_per_week': 2.0, 'transit_days': 14},
            {'carrier': 'HLD', 'service_name': 'IOS - Indian Ocean Service', 'port_rotation': ['INNSA', 'AEJEA', 'NLRTM', 'DEHAM'], 'frequency_days': 7, 'sailings_per_week': 2.0, 'transit_days': 21},
            {'carrier': 'ONE', 'service_name': 'PS3 - Pacific South 3', 'port_rotation': ['INNSA', 'SGSIN', 'CNSHA', 'USLAX'], 'frequency_days': 7, 'sailings_per_week': 1.0, 'transit_days': 30},
            {'carrier': 'MSC', 'service_name': 'Himalaya Express', 'port_rotation': ['INNSA', 'INMAA', 'AEJEA', 'NLRTM'], 'frequency_days': 7, 'sailings_per_week': 2.0, 'transit_days': 20},
            {'carrier': 'CMA', 'service_name': 'EPIC - Europe Pakistan India Consortium', 'port_rotation': ['INNSA', 'AEJEA', 'DEHAM', 'NLRTM'], 'frequency_days': 7, 'sailings_per_week': 2.0, 'transit_days': 22},
        ]
        for s in services_data:
            CarrierService.objects.update_or_create(
                carrier=carrier_objs[s['carrier']],
                service_name=s['service_name'],
                defaults={
                    'port_rotation': s['port_rotation'],
                    'frequency_days': s['frequency_days'],
                    'sailings_per_week': s['sailings_per_week'],
                    'transit_days': s['transit_days']
                }
            )
        self.stdout.write(self.style.SUCCESS('Seeded Carriers & Carrier Services.'))

        # 9. Commodities & HS Codes
        commodities_data = [
            {'hs_code': '851712', 'name': 'Smartphones & Telecommunication Apparatus', 'cargo_type': 'GEN', 'duty_rate_pct': Decimal('10.0')},
            {'hs_code': '520811', 'name': 'Unbleached Woven Cotton Fabric', 'cargo_type': 'GEN', 'duty_rate_pct': Decimal('7.50')},
            {'hs_code': '293339', 'name': 'Pharmaceutical Raw Chemical Compounds', 'cargo_type': 'HAZ', 'duty_rate_pct': Decimal('12.50')},
            {'hs_code': '847130', 'name': 'Laptops, Tablets & Processing Units', 'cargo_type': 'GEN', 'duty_rate_pct': Decimal('5.00')},
            {'hs_code': '090121', 'name': 'Roasted Arabica & Robusta Coffee Beans', 'cargo_type': 'PER', 'duty_rate_pct': Decimal('15.00')},
            {'hs_code': '870829', 'name': 'Automotive Body Parts & Structural Components', 'cargo_type': 'GEN', 'duty_rate_pct': Decimal('12.00')},
            {'hs_code': '300490', 'name': 'Packaged Medicaments & Vaccines', 'cargo_type': 'TEMP', 'duty_rate_pct': Decimal('5.00')},
        ]
        for com in commodities_data:
            Commodity.objects.update_or_create(hs_code=com['hs_code'], defaults=com)

        # 10. Business Calendars / Public Holidays
        holidays_list = [
            ('IN', '2026-08-15', 'Independence Day'),
            ('IN', '2026-10-02', 'Gandhi Jayanti'),
            ('IN', '2026-11-08', 'Diwali Deepavali'),
            ('US', '2026-09-07', 'Labor Day'),
            ('US', '2026-11-26', 'Thanksgiving Day'),
            ('US', '2026-12-25', 'Christmas Day'),
            ('AE', '2026-12-02', 'UAE National Day'),
            ('DE', '2026-10-03', 'German Unity Day'),
            ('CN', '2026-10-01', 'Golden Week National Day'),
        ]
        for c_code, dt_str, h_name in holidays_list:
            d_val = date.fromisoformat(dt_str)
            BusinessCalendar.objects.update_or_create(
                country_id=c_code,
                date=d_val,
                defaults={'holiday_name': h_name, 'is_holiday': True}
            )

        # 11. Seed Default Demo Users for the 3 Login Roles (User, Broker, Admin)
        org, _ = Organization.objects.get_or_create(
            code='FREIGHTIQ_DEMO',
            defaults={'name': 'FreightIQ Global Logistics', 'country': 'IN'}
        )

        demo_users = [
            {'username': 'user@freighthub.com', 'email': 'user@freighthub.com', 'password': 'User@123456', 'role': UserRole.CUSTOMER, 'first_name': 'Alex', 'last_name': 'Shipper', 'company_name': 'Apex Retail Corp'},
            {'username': 'broker@freighthub.com', 'email': 'broker@freighthub.com', 'password': 'Broker@123456', 'role': UserRole.BROKER, 'first_name': 'Marcus', 'last_name': 'Vance', 'company_name': 'FreightIQ Global Logistics'},
            {'username': 'admin@freighthub.com', 'email': 'admin@freighthub.com', 'password': 'Admin@123456', 'role': UserRole.ADMIN, 'first_name': 'Sarah', 'last_name': 'Connor', 'company_name': 'FreightIQ Enterprise Admin'},
            {'username': 'pricing@freighthub.com', 'email': 'pricing@freighthub.com', 'password': 'Pricing@123456', 'role': UserRole.PRICING_MANAGER, 'first_name': 'David', 'last_name': 'Miller', 'company_name': 'FreightIQ Global Logistics'},
        ]

        for u in demo_users:
            if not User.objects.filter(username=u['username']).exists():
                user_obj = User.objects.create_user(
                    username=u['username'],
                    email=u['email'],
                    password=u['password'],
                    role=u['role'],
                    first_name=u['first_name'],
                    last_name=u['last_name'],
                    company_name=u['company_name'],
                    organization=org,
                    is_staff=(u['role'] in (UserRole.ADMIN, UserRole.PRICING_MANAGER)),
                    is_superuser=(u['role'] == UserRole.ADMIN)
                )
                self.stdout.write(self.style.SUCCESS(f"Created demo user: {u['username']} [{u['role']}]"))

        self.stdout.write(self.style.SUCCESS('Master data seeding successfully completed!'))
