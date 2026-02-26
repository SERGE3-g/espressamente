#!/bin/bash
# ============================================================
# 📸 Espressamente — Download Tutte le Foto
# ============================================================
# Esegui questo script sul tuo Mac/PC per scaricare:
#   - Foto prodotto ufficiali Mokador DIVA
#   - Logo Mokador SVG
#   - Foto stock gratuite da Unsplash
#
# USO: chmod +x download-foto.sh && ./download-foto.sh
# ============================================================

set -e
BASE="espressamente-foto-download"
mkdir -p "$BASE"/{mokador/macchine,mokador/capsule,mokador/logo,stock,unsplash}

echo ""
echo "☕ Espressamente — Download Foto"
echo "================================"
echo ""

# ──────────────────────────────────────────
# MOKADOR — Macchine (dal sito ufficiale diva.mokador.it)
# ──────────────────────────────────────────
echo "📦 Scaricando macchine Mokador DIVA..."

curl -sL "https://diva.mokador.it/wp-content/uploads/2021/03/D1_quadrata.jpg" \
  -o "$BASE/mokador/macchine/mokador-d1.jpg"
echo "  ✓ D1"

curl -sL "https://diva.mokador.it/wp-content/uploads/2021/03/D2_quadrata.jpg" \
  -o "$BASE/mokador/macchine/mokador-d2.jpg"
echo "  ✓ D2"

curl -sL "https://diva.mokador.it/wp-content/uploads/2023/10/D3_quadrata.jpg" \
  -o "$BASE/mokador/macchine/mokador-d3-double.jpg"
echo "  ✓ D3 Double"

curl -sL "https://diva.mokador.it/wp-content/uploads/2024/02/M1_quadrata-2.jpg" \
  -o "$BASE/mokador/macchine/mokador-m1.jpg"
echo "  ✓ M1"

curl -sL "https://diva.mokador.it/wp-content/uploads/2024/12/M1-deluxe_quadrata.jpg" \
  -o "$BASE/mokador/macchine/mokador-m1-deluxe.jpg"
echo "  ✓ M1 Deluxe"

curl -sL "https://diva.mokador.it/wp-content/uploads/2021/03/macchine-d1-e-d2.jpg" \
  -o "$BASE/mokador/macchine/mokador-d1-d2-insieme.jpg"
echo "  ✓ D1+D2 insieme"

# ──────────────────────────────────────────
# MOKADOR — Capsule DIVA (foto prodotto ufficiali)
# ──────────────────────────────────────────
echo ""
echo "📦 Scaricando capsule Mokador DIVA..."

curl -sL "https://diva.mokador.it/wp-content/uploads/2021/03/capsula-sophia-medals_400x400px.jpg" \
  -o "$BASE/mokador/capsule/diva-sophia.jpg"
echo "  ✓ Sophia (aromatico e vellutato)"

curl -sL "https://diva.mokador.it/wp-content/uploads/2021/02/capsula-marilyn.jpg" \
  -o "$BASE/mokador/capsule/diva-marilyn.jpg"
echo "  ✓ Marilyn (pieno e corposo)"

curl -sL "https://diva.mokador.it/wp-content/uploads/2021/02/capsula-brigitte-medals_400x400px.jpg" \
  -o "$BASE/mokador/capsule/diva-brigitte.jpg"
echo "  ✓ Brigitte (delicato e fruttato)"

curl -sL "https://diva.mokador.it/wp-content/uploads/2021/02/capsula-grace.jpg" \
  -o "$BASE/mokador/capsule/diva-grace.jpg"
echo "  ✓ Grace (leggero, decaffeinato)"

curl -sL "https://diva.mokador.it/wp-content/uploads/2025/05/capsula-elizabeth.jpg" \
  -o "$BASE/mokador/capsule/diva-elizabeth.jpg"
echo "  ✓ Elizabeth (raffinato e profumato)"

curl -sL "https://diva.mokador.it/wp-content/uploads/2023/11/capsula-caramel_400x400px.jpg" \
  -o "$BASE/mokador/capsule/diva-caramel.jpg"
echo "  ✓ Caramel (dolce e irresistibile)"

curl -sL "https://diva.mokador.it/wp-content/uploads/2023/11/capsula-cortado_400x400px.jpg" \
  -o "$BASE/mokador/capsule/diva-cortado.jpg"
echo "  ✓ Cortado (cremoso e deciso)"

curl -sL "https://diva.mokador.it/wp-content/uploads/2022/10/capsula-chocko.jpg" \
  -o "$BASE/mokador/capsule/diva-chocko.jpg"
echo "  ✓ Chocko (goloso)"

curl -sL "https://diva.mokador.it/wp-content/uploads/2022/10/capsula-ginseng-classic.jpg" \
  -o "$BASE/mokador/capsule/diva-ginseng-classic.jpg"
echo "  ✓ Ginseng Classic"

curl -sL "https://diva.mokador.it/wp-content/uploads/2021/02/capsula-ginseng.jpg" \
  -o "$BASE/mokador/capsule/diva-ginseng.jpg"
echo "  ✓ Ginseng"

curl -sL "https://diva.mokador.it/wp-content/uploads/2022/11/capsula-gianduia.jpg" \
  -o "$BASE/mokador/capsule/diva-gianduia.jpg"
echo "  ✓ Gianduia"

curl -sL "https://diva.mokador.it/wp-content/uploads/2021/02/capsula-bevanda-bianca.jpg" \
  -o "$BASE/mokador/capsule/diva-bevanda-bianca.jpg"
echo "  ✓ Bevanda Bianca"

curl -sL "https://diva.mokador.it/wp-content/uploads/2021/02/capsula-te-al-limone.jpg" \
  -o "$BASE/mokador/capsule/diva-te-limone.jpg"
echo "  ✓ Tè al Limone"

curl -sL "https://diva.mokador.it/wp-content/uploads/2021/02/capsula-orzo.jpg" \
  -o "$BASE/mokador/capsule/diva-orzo.jpg"
echo "  ✓ Orzo"

# ──────────────────────────────────────────
# MOKADOR — Logo e banner
# ──────────────────────────────────────────
echo ""
echo "📦 Scaricando logo Mokador..."

curl -sL "https://diva.mokador.it/wp-content/themes/twentytwentyone/assets/images/mokador-footer-logo.svg" \
  -o "$BASE/mokador/logo/mokador-logo.svg"
echo "  ✓ Logo SVG"

curl -sL "https://diva.mokador.it/wp-content/uploads/2024/06/Footer-sito-Diva_capsule-riciclabili_ita.jpg" \
  -o "$BASE/mokador/mokador-capsule-banner.jpg"
echo "  ✓ Banner capsule"

# ──────────────────────────────────────────
# UNSPLASH — Foto stock gratuite (uso commerciale)
# ──────────────────────────────────────────
echo ""
echo "📦 Scaricando foto stock da Unsplash (free commercial use)..."

# Hero: espresso shot close-up
curl -sL "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=1920&q=80&auto=format" \
  -o "$BASE/unsplash/hero-espresso-shot.jpg"
echo "  ✓ Hero: espresso shot (Nathan Dumlao)"

# Coffee beans dark background
curl -sL "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80&auto=format" \
  -o "$BASE/unsplash/bg-coffee-beans.jpg"
echo "  ✓ Background: coffee beans dark"

# Warm coffee atmosphere
curl -sL "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80&auto=format" \
  -o "$BASE/unsplash/hero-coffee-cafe.jpg"
echo "  ✓ Hero: caffè atmosfera calda"

# Espresso cup on saucer
curl -sL "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=1920&q=80&auto=format" \
  -o "$BASE/unsplash/espresso-cup.jpg"
echo "  ✓ Tazza espresso"

# Dark beans background
curl -sL "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1920&q=80&auto=format" \
  -o "$BASE/unsplash/bg-beans-dark.jpg"
echo "  ✓ Background: chicchi scuro"

# Warm coffee/tea moment
curl -sL "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&q=80&auto=format" \
  -o "$BASE/unsplash/hero-warm.jpg"
echo "  ✓ Hero: momento caldo"

# Latte art
curl -sL "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=1920&q=80&auto=format" \
  -o "$BASE/unsplash/latte-art.jpg"
echo "  ✓ Latte art"

# Coffee shop interior
curl -sL "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80&auto=format" \
  -o "$BASE/unsplash/cafe-atmosphere.jpg"
echo "  ✓ Interno caffetteria"

# Espresso machine pro
curl -sL "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=1920&q=80&auto=format" \
  -o "$BASE/unsplash/espresso-machine.jpg"
echo "  ✓ Macchina espresso pro"

# Moka pot Italian
curl -sL "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=1920&q=80&auto=format" \
  -o "$BASE/unsplash/moka-italiana.jpg"
echo "  ✓ Moka italiana"

# Coffee beans close-up texture
curl -sL "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=1920&q=80&auto=format" \
  -o "$BASE/unsplash/beans-texture.jpg"
echo "  ✓ Texture chicchi"

# Barista pouring
curl -sL "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1920&q=80&auto=format" \
  -o "$BASE/unsplash/coffee-pour.jpg"
echo "  ✓ Caffè versato"

# ──────────────────────────────────────────
# RIEPILOGO
# ──────────────────────────────────────────
echo ""
echo "================================"
echo "✅ Download completato!"
echo ""
echo "📁 Struttura:"
find "$BASE" -type f | sort | while read f; do
  size=$(du -h "$f" | cut -f1)
  echo "  $size  $f"
done
echo ""
total=$(du -sh "$BASE" | cut -f1)
count=$(find "$BASE" -type f | wc -l)
echo "📊 Totale: $count file — $total"
echo ""
echo "👉 Prossimo passo:"
echo "   Copia la cartella '$BASE' dentro 'public/images/' del progetto Next.js"
echo ""
