# from flask import current_app as app
from flask_caching import Cache


def make_cache(app):
    app.config.from_mapping({
        "CACHE_TYPE": "RedisCache",
        "CACHE_REDIS_HOST": "localhost",
        "CACHE_REDIS_PORT": 6379
    })  # Setting up Redis Cache

    cache = Cache(app)  # cache instance
    app.app_context().push()

    return cache


# cache_obj = make_cache()
