if __name__ == "__main__":
    import uvicorn
    # Use import string format to enable reload properly
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)