"""Sincroniza Ubicato con la Agenda Universitaria de la UCB La Paz.

Descarga https://agenda.lpz.ucb.edu.bo/, lee los eventos que la página trae incrustados,
traduce el campo "lugar" a bloque y piso, y escribe eventos.json junto a index.html.
La app lee ese archivo al abrir. Solo usa la biblioteca estándar de Python.

Uso:  python actualizar_agenda.py
(en GitHub lo ejecuta solo cada hora el flujo .github/workflows/agenda.yml)
"""
import json
import re
import sys
import unicodedata
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

URL = "https://agenda.lpz.ucb.edu.bo/"
AQUI = Path(__file__).resolve().parent
SALIDAS = [AQUI / "eventos.json", AQUI / "publicar" / "eventos.json"]
BOLIVIA = timezone(timedelta(hours=-4))

# Niveles que tiene cada bloque (0 = PB). index.html traduce estas claves a sus puntos con BQ2P y los pisos con NIV.
NIVELES = {"A": 1, "B": 2, "C": 5, "D": 6, "F1": 4, "F2": 4, "G1": 3, "G2": 4, "H": 2, "I": 4, "J": 1, "K": 1, "L": 2, "CAP": 1}
# Letra de la agenda -> bloque de la maqueta
LETRAS = {"A": "A", "B": "B", "C": "C", "D": "D", "F": "F1", "G": "G2", "H": "H", "I": "I", "J": "J", "K": "K", "L": "L"}
# Lugares que la agenda nombra sin letra de bloque (texto ya sin tildes y en minúsculas)
PALABRAS = [("agora", "AGORA"), ("capilla el arca", "CAP"), ("coliseo", "A"), ("paraninfo", "D"),
            ("biblioteca", "I"), ("cafeteria", "H"), ("auditorio principal", "G2")]
ORDINALES = {"1er": 1, "1ro": 1, "2do": 2, "3er": 3, "3ro": 3, "4to": 4, "5to": 5, "6to": 6}


def plano(texto):
    t = unicodedata.normalize("NFD", texto or "")
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[\"“”'‘’.,]", " ", t)


def ubicar(lugar):
    """Devuelve (bloque, piso). bloque es None si el evento no es en un punto de la maqueta."""
    t = " ".join(plano(lugar).split())
    if not t or "http" in t:
        return None, 0
    bloque = None
    m = re.search(r"\bbloque ([a-l])\b", t)
    if m:
        bloque = LETRAS.get(m.group(1).upper())
    if "atrio principal" in t:          # "Bloque K, Atrio Principal": la plaza de ingreso
        bloque = "ATRIO"
    if bloque is None:
        for palabra, destino in PALABRAS:
            if palabra in t:
                bloque = destino
                break
    if bloque is None:
        return None, 0
    piso = 0
    m = re.search(r"\b(1er|1ro|2do|3er|3ro|4to|5to|6to)\b\s*piso", t)
    if m:
        piso = ORDINALES[m.group(1)]
    piso = max(0, min(piso, NIVELES.get(bloque, 1) - 1))
    return bloque, piso


def descargar():
    pedido = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (Ubicato agenda sync)"})
    with urllib.request.urlopen(pedido, timeout=40) as r:
        html = r.read().decode("utf-8", "replace")
    marca = "window.__EVENTOS__ = "
    i = html.index(marca) + len(marca)
    eventos, _ = json.JSONDecoder().raw_decode(html[i:])
    return eventos


def convertir(crudos, hoy):
    salida = []
    for e in crudos:
        if e.get("cancelado") or not e.get("fecha_inicio"):
            continue
        inicio = e["fecha_inicio"]
        ultimo_dia = (e.get("fecha_hasta") or e.get("fecha_fin") or inicio)[:10]
        if ultimo_dia < hoy.isoformat():      # ya terminó
            continue
        lugar = " ".join((e.get("lugar") or "").split())
        fin = e.get("fecha_fin") or ""
        bloque, piso = ubicar(lugar)
        if "http" in lugar:
            lugar = ""
        salida.append({
            "id": "ag" + str(e["id"]),
            "titulo": " ".join((e.get("titulo") or "").split()),
            "tipo": (e.get("categoria") or "evento").capitalize(),
            "bloque": bloque, "piso": piso,
            "lugar": lugar or "Lugar por confirmar",
            "fecha": inicio[:10], "hasta": ultimo_dia,
            "hora": inicio[11:16] if len(inicio) >= 16 else None,
            "fin": fin[11:16] if len(fin) >= 16 and fin[:10] == ultimo_dia else None,   # la app lo usa solo si existe
            "organizador": e.get("organizador") or "",
            "postergado": bool(e.get("postergado")),
        })
    salida.sort(key=lambda x: (x["fecha"], x["hora"] or ""))
    return salida


def main():
    ahora = datetime.now(BOLIVIA)
    crudos = descargar()
    eventos = convertir(crudos, ahora.date())
    datos = {"fuente": URL, "actualizado": ahora.strftime("%Y-%m-%d %H:%M"), "eventos": eventos}
    texto = json.dumps(datos, ensure_ascii=False, indent=1)
    for ruta in SALIDAS:
        if ruta.parent.exists():
            ruta.write_text(texto, encoding="utf-8")
    ubicados = sum(1 for e in eventos if e["bloque"])
    print(f"{len(crudos)} eventos en la agenda, {len(eventos)} vigentes, {ubicados} ubicados en la maqueta")
    for e in eventos:
        print(f"  {e['fecha']} {e['hora'] or '--:--'}  {(e['bloque'] or '-'):6} P{e['piso']}  {e['titulo'][:60]}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
