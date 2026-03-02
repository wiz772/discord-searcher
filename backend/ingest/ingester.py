import db
import os
import json
import logging


base_dir = os.path.dirname(os.path.abspath(__file__))
scrapped_folder = os.path.abspath(os.path.join(base_dir, "..", "scrapped_data"))


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)

def ingest():
    ingest_guilds()
    ingest_channels()
    ingest_messages()

def list_guilds():
    guilds = []
    folder = os.path.join(scrapped_folder, "guilds")
    for filename in os.listdir(folder):
        if filename.endswith(".json"):
            path = os.path.join(folder, filename)
            try:
                with open(path, 'r', encoding="utf-8") as f:
                    data = json.load(f)
                    guilds.extend(data)
                os.remove(os.path.join(folder, filename))
            except json.JSONDecodeError as e:
                logging.error(f"Error while listing guilds: {e}")
                tmp_path = path + ".tmp"
                os.rename(path, tmp_path)
    return guilds

def list_channels():
    channels = []
    folder = os.path.join(scrapped_folder, "channels")
    for filename in os.listdir(folder):
        if filename.endswith(".json"):
            path = os.path.join(folder, filename)
            try:
                with open(path, 'r', encoding="utf-8") as f:
                    data = json.load(f)
                    channels.extend(data)
                os.remove(os.path.join(folder, filename))
            except json.JSONDecodeError as e:
                logging.error(f"Error while listing channels: {e}")
                tmp_path = path + ".tmp"
                os.rename(path, tmp_path)
    return channels

def list_messages():
    messages = []
    folder = os.path.join(scrapped_folder, "messages")
    for filename in os.listdir(folder):
        if filename.endswith(".json"):
            path = os.path.join(folder, filename)
            try:
                with open(path, 'r', encoding="utf-8") as f:
                    data = json.load(f)
                    messages.extend(data)
                os.remove(os.path.join(folder, filename))
            except json.JSONDecodeError as e:
                logging.error(f"Error while listing messages: {e}")
                tmp_path = path + ".tmp"
                os.rename(path, tmp_path)
    return messages

def ingest_guilds():
    guilds_list = list_guilds()
    if guilds_list:
        db.insert_guilds(guilds_list)
        logging.info(f"Ingested {len(guilds_list)} guilds")


def ingest_channels():
    channels_list = list_channels()
    if channels_list:
        db.insert_channels(channels_list)
        logging.info(f"Ingested {len(channels_list)} channels")


def ingest_messages():
    messages_list = list_messages()
    if messages_list:
        db.insert_messages(messages_list)
        logging.info(f"Ingested {len(messages_list)} messages")


