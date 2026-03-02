import psycopg2
from psycopg2 import OperationalError
from dotenv import load_dotenv
import os
import logging

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
    
def insert_messages(messages):
    conn = get_connection()
    if not conn:
        return
    try:
        with conn:
            with conn.cursor() as cursor:
                sql= """
                INSERT INTO messages (message_id, user_id, guild_id, channel_id, sent_at, content)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (message_id) DO NOTHING
                """
                values = [(m.get('message_id'), m.get('user_id'), m.get('guild_id'), m.get('channel_id'), m.get('sent_at'), m.get('content')) for m in messages]
                cursor.executemany(sql, values)
    except Exception as e:
        logging.error(f"Error while inserting messages into DB: {e}")
    finally:
        conn.close()



def insert_channels(channels):
    conn = get_connection()
    if not conn:
        return
    try:
        with conn:
            with conn.cursor() as cursor:
                sql= """
                INSERT INTO channels (channel_id, guild_id, name)
                VALUES (%s, %s, %s)
                ON CONFLICT (channel_id) DO NOTHING
                """
                values = [(c.get('channel_id'), c.get('guild_id'), c.get('name')) for c in channels]
                cursor.executemany(sql, values)
    except Exception as e:
        logging.error(f"Error while inserting channels into DB: {e}")
    finally:
        conn.close()

def insert_guilds(guilds):
    conn = get_connection()
    if not conn:
        return
    try:
        with conn:
            with conn.cursor() as cursor:
                sql= """
                INSERT INTO guilds (guild_id, name, icon_url, owner_id)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (guild_id) DO NOTHING
                """
                values = [(g.get('guild_id'), g.get('name'), g.get('icon_url'),  g.get('owner_id')) for g in guilds]
                cursor.executemany(sql, values)
    except Exception as e:
        logging.error(f"Error while inserting guilds into DB: {e}")
    finally:
        conn.close()
