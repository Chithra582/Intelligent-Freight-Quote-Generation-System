"""
MongoDB Atlas Client & Collection Service for FreightIQ
Provides high-performance document storage for Quotations, Shipments,
Customer Feedback, Rate History, and Audit Logs.
"""

import os
from decouple import config

try:
    import certifi
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
    PYMONGO_AVAILABLE = True
except ImportError:
    certifi = None
    MongoClient = None
    PYMONGO_AVAILABLE = False

MONGODB_URI = config(
    'MONGODB_URI',
    default='mongodb+srv://dbuser:dbuser1234@cluster0.awyoltz.mongodb.net/freightiq?retryWrites=true&w=majority&appName=Cluster0'
)
MONGODB_DB_NAME = config('MONGODB_DB_NAME', default='freightiq')

_mongo_client = None
_mongo_db = None

def get_mongodb_client():
    """
    Returns singleton MongoClient with SSL/TLS certificate configuration.
    """
    global _mongo_client
    if not PYMONGO_AVAILABLE:
        return None
    if _mongo_client is None:
        try:
            tls_ca = certifi.where() if certifi else None
            _mongo_client = MongoClient(
                MONGODB_URI,
                tlsCAFile=tls_ca,
                tlsAllowInvalidCertificates=True,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=10000,
                maxPoolSize=50
            )
        except Exception as e:
            print(f"[MongoDB Atlas] Connection initialization warning: {e}")
            return None
    return _mongo_client



def get_mongodb_db():
    """
    Returns the FreightIQ MongoDB database instance.
    """
    global _mongo_db
    if _mongo_db is None:
        client = get_mongodb_client()
        if client:
            _mongo_db = client[MONGODB_DB_NAME]
    return _mongo_db

def ping_mongodb():
    """
    Pings MongoDB Atlas to verify connection health.
    """
    client = get_mongodb_client()
    if not client:
        return {"status": "error", "message": "Client not initialized"}
    try:
        client.admin.command('ping')
        return {
            "status": "connected",
            "database": MONGODB_DB_NAME,
            "collections": get_mongodb_db().list_collection_names() if get_mongodb_db() is not None else []
        }
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}

# === Document Helper Functions ===

def mongo_save_quote(quote_dict):
    """Save or update quotation in MongoDB quotations collection"""
    try:
        db = get_mongodb_db()
        if db is not None:
            quote_id = quote_dict.get('id') or quote_dict.get('quote_id')
            if quote_id:
                db.quotations.replace_one({'id': quote_id}, quote_dict, upsert=True)
            else:
                db.quotations.insert_one(quote_dict)
            return True
    except Exception as err:
        print(f"[MongoDB] Save quote error: {err}")
    return False

def mongo_get_quotes(filter_query=None, limit=100):
    """Retrieve quotations from MongoDB"""
    try:
        db = get_mongodb_db()
        if db is not None:
            cursor = db.quotations.find(filter_query or {}, {'_id': 0}).limit(limit)
            return list(cursor)
    except Exception as err:
        print(f"[MongoDB] Get quotes error: {err}")
    return []

def mongo_save_shipment(shipment_dict):
    """Save or update shipment in MongoDB shipments collection"""
    try:
        db = get_mongodb_db()
        if db is not None:
            shipment_id = shipment_dict.get('id') or shipment_dict.get('shipment_id')
            if shipment_id:
                db.shipments.replace_one({'id': shipment_id}, shipment_dict, upsert=True)
            else:
                db.shipments.insert_one(shipment_dict)
            return True
    except Exception as err:
        print(f"[MongoDB] Save shipment error: {err}")
    return False

def mongo_get_shipments(filter_query=None, limit=100):
    """Retrieve shipments from MongoDB"""
    try:
        db = get_mongodb_db()
        if db is not None:
            cursor = db.shipments.find(filter_query or {}, {'_id': 0}).limit(limit)
            return list(cursor)
    except Exception as err:
        print(f"[MongoDB] Get shipments error: {err}")
    return []

def mongo_save_feedback(feedback_dict):
    """Save customer feedback in MongoDB feedback collection"""
    try:
        db = get_mongodb_db()
        if db is not None:
            db.feedback.insert_one(feedback_dict)
            return True
    except Exception as err:
        print(f"[MongoDB] Save feedback error: {err}")
    return False

def mongo_get_feedback(filter_query=None, limit=50):
    """Retrieve customer feedbacks from MongoDB"""
    try:
        db = get_mongodb_db()
        if db is not None:
            cursor = db.feedback.find(filter_query or {}, {'_id': 0}).limit(limit)
            return list(cursor)
    except Exception as err:
        print(f"[MongoDB] Get feedback error: {err}")
    return []
