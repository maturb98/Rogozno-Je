import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'rogozno-je-secret-change-in-production')
    
    # SQLite by default, easy transition to PostgreSQL via DATABASE_URL
    # Example PostgreSQL: postgresql://user:password@localhost:5432/rogozno_je
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f"sqlite:///{os.path.join(basedir, 'rogozno_je.db')}"
    )
    if SQLALCHEMY_DATABASE_URI.startswith('postgres://'):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace('postgres://', 'postgresql://', 1)

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Test phone number for Test Burger
    TEST_RESTAURANT_PHONE = os.environ.get('TEST_RESTAURANT_PHONE', '+48500123456')
    
    # Uploads
    UPLOAD_FOLDER = os.path.join(basedir, 'app', 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max
