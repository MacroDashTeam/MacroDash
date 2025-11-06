#!/usr/bin/env python3
"""
Test MongoDB Atlas Connection
Usage: python3 test_mongodb_atlas.py
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

def test_connection():
    """Test MongoDB Atlas connection"""

    uri = os.getenv('MONGODB_URI')

    if not uri:
        print("❌ MONGODB_URI not found in .env file")
        return False

    if '<db_password>' in uri:
        print("❌ Please replace <db_password> with your actual MongoDB Atlas password in .env file")
        print("\nTo get your password:")
        print("1. Go to https://cloud.mongodb.com")
        print("2. Navigate to Database Access")
        print("3. Reset password if needed")
        print("4. Update MONGODB_URI in server/.env")
        return False

    print(f"🔗 Connecting to MongoDB Atlas...")
    print(f"   URI: {uri.split('@')[1].split('?')[0]}")  # Hide credentials

    try:
        # Connect with timeout
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)

        # Test connection
        client.admin.command('ping')

        # Get database info
        db = client['macrodash']
        collections = db.list_collection_names()

        print("\n✅ MongoDB Atlas connection successful!")
        print(f"\n📊 Database: macrodash")
        print(f"   Collections: {len(collections)}")

        if collections:
            print(f"   Names: {', '.join(collections)}")

            # Show document counts
            for collection in collections:
                count = db[collection].count_documents({})
                print(f"   - {collection}: {count} documents")
        else:
            print("   (No collections yet - will be created on first use)")

        # Test write operation
        print("\n🧪 Testing write operation...")
        test_collection = db['test_connection']
        result = test_collection.insert_one({'test': 'connection', 'timestamp': 'now'})
        test_collection.delete_one({'_id': result.inserted_id})
        print("   ✅ Write test successful")

        client.close()
        return True

    except Exception as e:
        print(f"\n❌ Connection failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check your password in .env file")
        print("2. Verify IP whitelist in MongoDB Atlas (0.0.0.0/0 for any IP)")
        print("3. Ensure cluster is running")
        return False

if __name__ == '__main__':
    print("\n" + "="*60)
    print(" MongoDB Atlas Connection Test")
    print("="*60 + "\n")

    success = test_connection()

    if success:
        print("\n✅ Ready to use MongoDB Atlas!")
        print("\n💡 Next steps:")
        print("   1. Restart Django server to use Atlas")
        print("   2. Activity tracking will start automatically")
        print("   3. Data will be stored in the cloud\n")
    else:
        print("\n❌ Please fix the connection issues above\n")
