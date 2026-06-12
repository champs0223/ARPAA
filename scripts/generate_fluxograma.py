from PIL import Image, ImageDraw, ImageFont

W, H = 1400, 900
bg = (255, 255, 255)
img = Image.new('RGB', (W, H), bg)
d = ImageDraw.Draw(img)

try:
    font = ImageFont.truetype('arial.ttf', 14)
except:
    from PIL import ImageFont as _if
    font = _if.load_default()

def box(x1, y1, x2, y2, text, fill=(230,245,255)):
    d.rounded_rectangle([x1,y1,x2,y2], radius=12, fill=fill, outline=(0,70,120))
    # center multiline text
    try:
        bbox = d.multiline_textbbox((0,0), text, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
    except Exception:
        # fallback to font.getsize for older Pillow
        lines = text.split('\n')
        w = max(font.getsize(line)[0] for line in lines)
        h = sum(font.getsize(line)[1] for line in lines)
    tx = x1 + (x2-x1 - w)/2
    ty = y1 + (y2-y1 - h)/2
    d.multiline_text((tx,ty), text, fill=(10,10,10), font=font, align='center')

def arrow(x1, y1, x2, y2, color=(0,70,120)):
    d.line((x1,y1,x2,y2), fill=color, width=3)
    # arrow head
    import math
    angle = math.atan2(y2-y1, x2-x1)
    ah = 12
    p1 = (x2 - ah*math.cos(angle - math.pi/6), y2 - ah*math.sin(angle - math.pi/6))
    p2 = (x2 - ah*math.cos(angle + math.pi/6), y2 - ah*math.sin(angle + math.pi/6))
    d.polygon([p1, p2, (x2,y2)], fill=color)

# Title
d.text((20,10), 'Fluxograma: Integração e Registro (Sistema ARPAA)', fill=(0,0,0), font=font)

# Boxes
box(100,60,600,140, 'Frontend Público\n(visualizar animais, formularios)')
box(400,200,1000,280, 'API / Endpoints\n(ROTAS: animais, adocoes, solicitacoes, usuarios, upload)')
box(400,340,1000,420, 'Autenticação\n(login, JWT/sessao)')
box(400,480,1000,620, 'Banco de Dados\n(tabelas: usuarios, animais, adocoes, solicitacoes, historico)')
box(100,320,350,420, 'Uploads / Mídia\n(validação + armazenamento, retorna URL)')
box(100,480,350,560, 'Painel Admin\n(UI admin, CRUD, aprovações)')
box(100,620,350,700, 'Métricas / Histórico\n(agregação para dashboard)')

# Arrows
arrow(350,140,430,200)
arrow(700,280,700,340)
arrow(700,420,700,480)
arrow(700,540,500,540)
arrow(300,360,400,360)
arrow(280,520,400,520)
arrow(280,660,400,660)

# Labels near arrows
d.text((320,160), 'POST /usuarios (registro)\nPOST /auth (login)\nPOST /upload', fill=(0,0,0), font=font)

# Save
out = 'docs/fluxograma_integracao_registro.png'
img.save(out)
print('Saved', out)
