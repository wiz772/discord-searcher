from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
import psycopg2.extras
from psycopg2 import OperationalError
from dotenv import load_dotenv
import os
import requests


app = FastAPI(title="Discord Messages Searcher")


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print(f"CORS middleware configured, allow_origins={origins}")


load_dotenv()
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")

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

class Message(BaseModel):
    message_id: str
    user_id: str
    guild_id: str
    channel_id: str
    content: str
    sent_at: str

class Channel(BaseModel):
    channel_id: str
    guild_id: str
    name: str

class Guild(BaseModel):
    guild_id: str
    name: str
    icon_url: str | None
    owner_id: str | None

class UserInfo(BaseModel):
    username: str
    discriminator: str
    avatar: Optional[str]
    id: str

# ----------------------
# Endpoint 1 : info d'un utilisateur Discord via l'API Discord
# ----------------------
@app.get("/discord/user/{user_id}", response_model=UserInfo)
def get_discord_user(user_id: str):
    if not DISCORD_BOT_TOKEN:
        raise HTTPException(status_code=500, detail="Discord bot token not configured")
    
    try:
        headers = {
            "Authorization": f"Bot {DISCORD_BOT_TOKEN}"
        }
        res = requests.get(f"https://discord.com/api/v10/users/{user_id}", headers=headers)
        
        if res.status_code == 404:
            raise HTTPException(status_code=404, detail="User not found")
        elif not res.ok:
            raise HTTPException(status_code=res.status_code, detail=f"Discord API error: {res.text}")
        
        user = res.json()
        return {
            "username": user.get("username", "Unknown"),
            "discriminator": user.get("discriminator", "0000"),
            "avatar": user.get("avatar"),
            "id": user.get("id")
        }
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Discord API: {str(e)}")

# ----------------------
# Endpoint 2 : guilds où l'utilisateur a parlé
# ----------------------
@app.get("/user/{user_id}/guilds", response_model=List[Guild])
def get_user_guilds(user_id: str):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Cannot connect to DB")
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("""
                SELECT DISTINCT g.guild_id, g.name, g.icon_url, g.owner_id
                FROM messages m
                JOIN guilds g ON m.guild_id = g.guild_id
                WHERE m.user_id::text = %s
            """, (user_id,))
            rows = cur.fetchall()

            return [
                {
                    "guild_id": str(row["guild_id"]),
                    "name": row["name"],
                    "icon_url": row["icon_url"],
                    "owner_id": str(row["owner_id"]) if row["owner_id"] else None
                }
                for row in rows
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# ----------------------
# Endpoint 3 : channels où l'utilisateur a parlé dans une guild
# ----------------------
@app.get("/user/{user_id}/guild/{guild_id}/channels", response_model=List[Channel])
def get_user_channels(user_id: str, guild_id: str):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Cannot connect to DB")
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("""
                SELECT DISTINCT c.channel_id, c.guild_id, c.name
                FROM messages m
                JOIN channels c ON m.channel_id = c.channel_id
                WHERE m.user_id::text = %s AND m.guild_id::text = %s
            """, (user_id, guild_id))
            rows = cur.fetchall()

            return [
                {
                    "channel_id": str(row["channel_id"]),
                    "guild_id": str(row["guild_id"]),
                    "name": row["name"]
                }
                for row in rows
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# ----------------------
# Endpoint 4 : messages d'un utilisateur dans un channel
# ----------------------
@app.get("/user/{user_id}/channel/{channel_id}/messages", response_model=List[Message])
def get_user_messages(user_id: str, channel_id: str):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Cannot connect to DB")
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("""
                SELECT *
                FROM messages
                WHERE user_id::text = %s AND channel_id::text = %s
                ORDER BY sent_at DESC
            """, (user_id, channel_id))

            rows = cur.fetchall()

            return [
                {
                    "message_id": str(row["message_id"]),
                    "user_id": str(row["user_id"]),
                    "guild_id": str(row["guild_id"]),
                    "channel_id": str(row["channel_id"]),
                    "content": row["content"],
                    "sent_at": str(row["sent_at"])
                }
                for row in rows
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()