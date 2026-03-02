import time
import logging
import ingester

def loop_ingest():
    while True:
        try:
            ingester.ingest()
        except Exception as e:
            logging.error(f"Ingest failed: {e}")
        time.sleep(20)

def main():
    loop_ingest()

if __name__ == "__main__":
    main()