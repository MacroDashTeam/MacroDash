"""
MongoDB Service Layer for MacroDash
Handles: News Cache, Watchlists, User Activity Tracking
"""

from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import PyMongoError
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import os


class MongoDBService:
    """Singleton service for MongoDB operations"""

    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._initialize()
        return cls._instance

    @classmethod
    def _initialize(cls):
        """Initialize MongoDB connection"""
        try:
            mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')

            # Debug logging to check what URI we're using
            if mongo_uri:
                # Hide password for security in logs
                import re
                safe_uri = re.sub(r'://([^:]+):([^@]+)@', r'://\1:****@', mongo_uri)
                print(f"🔍 MongoDB URI from env: {safe_uri}")
            else:
                print("⚠️ MONGODB_URI not set, using default: mongodb://localhost:27017/")

            cls._client = MongoClient(mongo_uri)
            cls._db = cls._client['macrodash']

            # Create collections and indexes
            cls._setup_collections()

            print("✅ MongoDB connected successfully")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            cls._client = None
            cls._db = None

    @classmethod
    def _setup_collections(cls):
        """Set up collections with indexes"""
        db = cls._db

        # News Cache Collection
        if 'news_cache' not in db.list_collection_names():
            db.create_collection('news_cache')
        db.news_cache.create_index([('symbol', ASCENDING)])
        db.news_cache.create_index([('last_updated', DESCENDING)])
        db.news_cache.create_index([('last_updated', ASCENDING)], expireAfterSeconds=3600)  # 1 hour TTL

        # Watchlists Collection
        if 'watchlists' not in db.list_collection_names():
            db.create_collection('watchlists')
        db.watchlists.create_index([('user_id', ASCENDING)])
        db.watchlists.create_index([('user_id', ASCENDING), ('name', ASCENDING)], unique=True)

        # User Activity Collection
        if 'user_activity' not in db.list_collection_names():
            db.create_collection('user_activity')
        db.user_activity.create_index([('user_id', ASCENDING)])
        db.user_activity.create_index([('timestamp', DESCENDING)])
        db.user_activity.create_index([('timestamp', ASCENDING)], expireAfterSeconds=2592000)  # 30 days TTL
        db.user_activity.create_index([('action', ASCENDING)])
        db.user_activity.create_index([('symbol', ASCENDING)])

        print("✅ MongoDB collections and indexes created")

    @property
    def db(self):
        """Get database instance"""
        if self._db is None:
            self._initialize()
        return self._db

    @property
    def is_connected(self):
        """Check if MongoDB is connected"""
        return self._db is not None


# ==================== NEWS CACHE SERVICE ====================

class NewsCacheService:
    """Cache news articles in MongoDB"""

    def __init__(self):
        self.mongo = MongoDBService()
        self.collection = self.mongo.db.news_cache if self.mongo.is_connected else None

    def get_cached_news(self, symbol: str) -> Optional[Dict]:
        """Get cached news for a symbol"""
        if self.collection is None:
            return None

        try:
            news = self.collection.find_one({'symbol': symbol})
            if news and news.get('last_updated'):
                # Check if cache is still valid (less than 1 hour old)
                if datetime.now() - news['last_updated'] < timedelta(hours=1):
                    return news
        except PyMongoError as e:
            print(f"Error getting cached news: {e}")

        return None

    def cache_news(self, symbol: str, news_articles: List[Dict]) -> bool:
        """Cache news articles for a symbol"""
        if self.collection is None:
            return False

        try:
            doc = {
                'symbol': symbol,
                'news': news_articles,
                'last_updated': datetime.now(),
                'count': len(news_articles)
            }

            self.collection.update_one(
                {'symbol': symbol},
                {'$set': doc},
                upsert=True
            )
            return True
        except PyMongoError as e:
            print(f"Error caching news: {e}")
            return False

    def clear_cache(self, symbol: Optional[str] = None):
        """Clear news cache (all or specific symbol)"""
        if self.collection is None:
            return False

        try:
            if symbol:
                self.collection.delete_one({'symbol': symbol})
            else:
                self.collection.delete_many({})
            return True
        except PyMongoError as e:
            print(f"Error clearing cache: {e}")
            return False


# ==================== WATCHLIST SERVICE ====================

class WatchlistService:
    """Manage user watchlists in MongoDB"""

    def __init__(self):
        self.mongo = MongoDBService()
        self.collection = self.mongo.db.watchlists if self.mongo.is_connected else None

    def get_user_watchlists(self, user_id: str) -> List[Dict]:
        """Get all watchlists for a user"""
        if self.collection is None:
            return []

        try:
            watchlists = list(self.collection.find({'user_id': user_id}))
            # Remove MongoDB _id field
            for w in watchlists:
                w['id'] = str(w.pop('_id'))
            return watchlists
        except PyMongoError as e:
            print(f"Error getting watchlists: {e}")
            return []

    def create_watchlist(self, user_id: str, name: str, symbols: List[str] = None) -> Optional[Dict]:
        """Create a new watchlist"""
        if self.collection is None:
            return None

        try:
            doc = {
                'user_id': user_id,
                'name': name,
                'symbols': symbols or [],
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }

            result = self.collection.insert_one(doc)
            doc['id'] = str(result.inserted_id)
            doc.pop('_id', None)
            return doc
        except PyMongoError as e:
            print(f"Error creating watchlist: {e}")
            return None

    def add_symbol_to_watchlist(self, user_id: str, watchlist_name: str, symbol: str) -> bool:
        """Add a symbol to a watchlist"""
        if self.collection is None:
            return False

        try:
            result = self.collection.update_one(
                {'user_id': user_id, 'name': watchlist_name},
                {
                    '$addToSet': {'symbols': symbol},
                    '$set': {'updated_at': datetime.now()}
                }
            )
            return result.modified_count > 0
        except PyMongoError as e:
            print(f"Error adding symbol: {e}")
            return False

    def remove_symbol_from_watchlist(self, user_id: str, watchlist_name: str, symbol: str) -> bool:
        """Remove a symbol from a watchlist"""
        if self.collection is None:
            return False

        try:
            result = self.collection.update_one(
                {'user_id': user_id, 'name': watchlist_name},
                {
                    '$pull': {'symbols': symbol},
                    '$set': {'updated_at': datetime.now()}
                }
            )
            return result.modified_count > 0
        except PyMongoError as e:
            print(f"Error removing symbol: {e}")
            return False

    def delete_watchlist(self, user_id: str, watchlist_name: str) -> bool:
        """Delete a watchlist"""
        if self.collection is None:
            return False

        try:
            result = self.collection.delete_one({
                'user_id': user_id,
                'name': watchlist_name
            })
            return result.deleted_count > 0
        except PyMongoError as e:
            print(f"Error deleting watchlist: {e}")
            return False


# ==================== USER ACTIVITY TRACKING ====================

class UserActivityService:
    """Track user activity in MongoDB"""

    def __init__(self):
        self.mongo = MongoDBService()
        self.collection = self.mongo.db.user_activity if self.mongo.is_connected else None

    def track_activity(self, user_id: str, action: str, **kwargs) -> bool:
        """
        Track a user activity

        Args:
            user_id: User identifier (can be email or user ID)
            action: Type of action (view_stock, search, create_alert, etc.)
            **kwargs: Additional data (symbol, query, page, etc.)

        Returns:
            bool: Success status
        """
        if self.collection is None:
            return False

        try:
            doc = {
                'user_id': user_id,
                'action': action,
                'timestamp': datetime.now(),
                **kwargs
            }

            self.collection.insert_one(doc)
            return True
        except PyMongoError as e:
            print(f"Error tracking activity: {e}")
            return False

    def get_user_activity(self, user_id: str, limit: int = 50, action: Optional[str] = None) -> List[Dict]:
        """Get recent user activity"""
        if self.collection is None:
            return []

        try:
            query = {'user_id': user_id}
            if action:
                query['action'] = action

            activities = list(
                self.collection.find(query)
                .sort('timestamp', DESCENDING)
                .limit(limit)
            )

            # Remove MongoDB _id field
            for activity in activities:
                activity['id'] = str(activity.pop('_id'))

            return activities
        except PyMongoError as e:
            print(f"Error getting activity: {e}")
            return []

    def get_popular_stocks(self, days: int = 7, limit: int = 10) -> List[Dict]:
        """Get most viewed stocks in the last N days"""
        if self.collection is None:
            return []

        try:
            since = datetime.now() - timedelta(days=days)

            pipeline = [
                {
                    '$match': {
                        'action': 'view_stock',
                        'timestamp': {'$gte': since},
                        'symbol': {'$exists': True}
                    }
                },
                {
                    '$group': {
                        '_id': '$symbol',
                        'count': {'$sum': 1},
                        'unique_users': {'$addToSet': '$user_id'}
                    }
                },
                {
                    '$project': {
                        'symbol': '$_id',
                        'views': '$count',
                        'unique_users': {'$size': '$unique_users'},
                        '_id': 0
                    }
                },
                {'$sort': {'views': -1}},
                {'$limit': limit}
            ]

            return list(self.collection.aggregate(pipeline))
        except PyMongoError as e:
            print(f"Error getting popular stocks: {e}")
            return []

    def get_user_stats(self, user_id: str, days: int = 30) -> Dict:
        """Get user activity statistics"""
        if self.collection is None:
            return {}

        try:
            since = datetime.now() - timedelta(days=days)

            pipeline = [
                {
                    '$match': {
                        'user_id': user_id,
                        'timestamp': {'$gte': since}
                    }
                },
                {
                    '$group': {
                        '_id': '$action',
                        'count': {'$sum': 1}
                    }
                }
            ]

            results = list(self.collection.aggregate(pipeline))

            stats = {
                'total_activities': sum(r['count'] for r in results),
                'actions': {r['_id']: r['count'] for r in results},
                'period_days': days
            }

            return stats
        except PyMongoError as e:
            print(f"Error getting user stats: {e}")
            return {}
