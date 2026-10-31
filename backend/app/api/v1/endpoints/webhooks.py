import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.db.session import get_db
from app.security.webhooks import verify_resend_signature
from app.services import email_service, inbound_monitor

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/webhooks",
    tags=["Webhooks"],
)


@router.post("/resend")
async def receive_resend_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    if not settings.RESEND_WEBHOOK_SECRET:
        inbound_monitor.record("no_secret", detail="RESEND_WEBHOOK_SECRET no está configurada")
        logger.error("Webhook de Resend recibido pero falta RESEND_WEBHOOK_SECRET")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Falta configurar RESEND_WEBHOOK_SECRET en el servidor",
        )

    payload = await request.body()

    signature_is_valid = verify_resend_signature(
        payload=payload,
        secret=settings.RESEND_WEBHOOK_SECRET,
        svix_id=request.headers.get("svix-id"),
        svix_timestamp=request.headers.get("svix-timestamp"),
        svix_signature=request.headers.get("svix-signature"),
    )

    if not signature_is_valid:
        has_headers = bool(request.headers.get("svix-id") and request.headers.get("svix-signature"))
        inbound_monitor.record("bad_signature", detail="firma que no coincide con el secreto" if has_headers else "sin cabeceras de firma (no viene de Resend)")
        logger.warning("Webhook de Resend rechazado: firma inválida (cabeceras presentes: %s)", has_headers)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firma del webhook inválida",
        )

    try:
        event = json.loads(payload)
    except json.JSONDecodeError:
        inbound_monitor.record("bad_json")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El cuerpo del webhook no es JSON válido",
        ) from None

    try:
        result = await run_in_threadpool(email_service.handle_webhook_event, db, event)
    except Exception as error:  # noqa: BLE001 - se registra y se deja que el framework responda 500
        inbound_monitor.record("error", event=event.get("type"), detail=str(error)[:200])
        logger.exception("Falló el procesamiento del webhook de Resend")
        raise
    inbound_monitor.record(result, event=event.get("type"))

    return {"success": True, "result": result}
