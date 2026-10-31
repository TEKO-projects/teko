import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.cors import setup_cors
from app.db.session import SessionLocal
from app.repositories import mailbox_repository

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # El correo de una persona con buzón no debe verse en General. Si había correo viejo
    # marcado como general, se corrige solo al arrancar (no depende de correr la migración).
    try:
        with SessionLocal() as db:
            moved, linked = mailbox_repository.reclassify_general(db, settings.RESEND_FROM_EMAIL)
        if moved:
            logger.warning("Correo reclasificado al arrancar: %s salieron de General, %s enlazados a su buzón.", moved, linked)
    except Exception:  # noqa: BLE001 - un fallo aquí no debe impedir que la API arranque
        logger.exception("No se pudo reclasificar el correo general al arrancar")
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="0.1.0",
        lifespan=lifespan,
    )

    setup_cors(app)
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.get("/")
    def root():
        return {
            "success": True,
            "message": "TEKO API funcionando, ESTA VIVAAAAAAAAAAAAAAAAAAAAAAAA",
            "environment": settings.ENVIRONMENT,
        }

    return app


app = create_app()