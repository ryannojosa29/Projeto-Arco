#!/usr/bin/env python3
"""Gera docs/ROADMAP-DEMOCK.md a partir de assets/data-status.json.

Uso: python3 scripts/gen_roadmap.py
O .json é a ÚNICA fonte de verdade; este doc é derivado (não edite à mão).
"""
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "data-status.json"
OUT = ROOT / "docs" / "ROADMAP-DEMOCK.md"

EMOJI = {"real": "✅", "partial": "🟡", "mock": "⬜"}
ROTULO = {"real": "real", "partial": "parcial", "mock": "mockado"}


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    fases = data["fases"]
    doms = data["dominios"]

    total = len(doms)
    reais = sum(1 for d in doms.values() if d["status"] == "real")
    pct = round(reais / total * 100) if total else 0

    L = []
    L.append("# Roadmap de des-mock — Arco")
    L.append("")
    L.append("> **Gerado automaticamente** de `assets/data-status.json`. Não edite à mão —")
    L.append("> mude o `status` de um domínio no JSON e rode `python3 scripts/gen_roadmap.py`.")
    L.append("")
    L.append(f"**Progresso:** {reais}/{total} domínios reais ({pct}%).")
    L.append("")
    L.append("## Como funciona")
    L.append("")
    L.append("Um app só, dois modos (em `assets/js/config.js` → `ARCO.MODE`):")
    L.append("")
    L.append("- **`demo`** (padrão no repo): mostra o produto inteiro; o que não é `real` ganha")
    L.append("  selo **DEMONSTRATIVO**. É a versão a ser perseguida pela equipe.")
    L.append("- **`official`**: o que está `mock` é **bloqueado** com aviso *\"disponível em breve\"*;")
    L.append("  só o que é `real` (e `partial`) navega. Nada de dado fake passando por real.")
    L.append("")
    L.append("Quando todos os domínios virarem `real`, `official` == `demo` == produto completo.")
    L.append("")
    L.append("Legenda: ✅ real · 🟡 parcial · ⬜ mockado")
    L.append("")

    # agrupa por fase
    L.append("## Por fase")
    for fid in sorted(fases, key=lambda x: int(x)):
        itens = [(k, v) for k, v in doms.items() if str(v.get("fase")) == str(fid)]
        if not itens:
            continue
        feitos = sum(1 for _, v in itens if v["status"] == "real")
        L.append("")
        L.append(f"### Fase {fid} — {fases[fid]}  ({feitos}/{len(itens)})")
        L.append("")
        for k, v in sorted(itens, key=lambda kv: (kv[1]["status"] != "real", kv[0])):
            box = "x" if v["status"] == "real" else " "
            nota = f" — _{v['nota']}_" if v.get("nota") else ""
            navtag = "" if v.get("nav") else " `(interno)`"
            L.append(f"- [{box}] {EMOJI[v['status']]} **{v['label']}**{navtag} — `{k}`{nota}")
    L.append("")

    # tabela geral
    L.append("## Tabela geral")
    L.append("")
    L.append("| Domínio | O que é | Status | Fase |")
    L.append("|---|---|---|---|")
    for k, v in sorted(doms.items(), key=lambda kv: (kv[1]["fase"], kv[1]["status"] != "real", kv[0])):
        L.append(f"| `{k}` | {v['label']} | {EMOJI[v['status']]} {ROTULO[v['status']]} | {v['fase']} |")
    L.append("")
    L.append(f"<sub>Gerado em {date.today().isoformat()}.</sub>")
    L.append("")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(L), encoding="utf-8")
    print(f"OK → {OUT.relative_to(ROOT)}  ({reais}/{total} reais, {pct}%)")


if __name__ == "__main__":
    main()
