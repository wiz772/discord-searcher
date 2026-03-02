import psycopg2
from psycopg2 import OperationalError
from dotenv import load_dotenv
import os

load_dotenv()  
DB_NAME = os.getenv("DB_NAME")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
PORT = int(os.getenv("PORT"))


def get_connection():
    try:
        return psycopg2.connect(
            dbname=DB_NAME,
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT
        )
    except OperationalError as e:
        print(f"Error while connecting to DB: {e}")
        return None


def create_tables():
    conn = get_connection()
    if not conn:
        return

    try:
        with conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS messages (
                        message_id BIGINT PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        guild_id BIGINT NOT NULL,
                        channel_id BIGINT NOT NULL,
                        sent_at TIMESTAMP NOT NULL,
                        content TEXT
                    );
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS guilds (
                        guild_id BIGINT PRIMARY KEY,
                        name TEXT NOT NULL,
                        icon_url TEXT,
                        owner_id BIGINT
                    );
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS channels (
                        channel_id BIGINT PRIMARY KEY,
                        guild_id BIGINT NOT NULL,
                        name TEXT NOT NULL
                    );
                """)
        print("Tables created successfully.")
    except Exception as e:
        print(f"Error while creating tables: {e}")
    finally:
        conn.close()


def main():
    create_tables()


if __name__ == "__main__":
    main()