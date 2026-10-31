"""Bitácora corta (en memoria) de las llamadas que Resend hace al webhook.

Sirve para diagnosticar por qué no llega correo: si no hay ninguna llamada, Resend no
está avisando (DNS/MX o webhook mal configurado); si hay llamadas rechazadas, el
secreto no coincide. Se reinicia con la API; no guarda contenido de los correos.
"""
import threading
from collections import deque
from datetime import datetime, timezone

_events: deque[dict] = deque(maxlen=50)
_lock = threading.Lock()
STARTED_AT = datetime.now(timezone.utc)


def record(outcome: str, *, event: str | None = None, detail: str | None = None) -> None:
    with _lock:
        _events.appendleft({"at": datetime.now(timezone.utc), "outcome": outcome, "event": event, "detail": detail})


def recent() -> list[dict]:
    with _lock:
        return list(_events)
