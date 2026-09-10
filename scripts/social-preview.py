"""Render the site's sharing card. Requires Pillow; no external assets."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[1]
S = 2
im = Image.new('RGB', (1200*S, 630*S), '#FBF9F4')
d = ImageDraw.Draw(im)
ink, blue, purple = '#22242B', '#3D6FF0', '#7C5CFC'
def font(size, bold=False):
    filename = 'Arial Bold.ttf' if bold else 'Arial.ttf'
    return ImageFont.truetype('/System/Library/Fonts/Supplemental/' + filename, size*S)
def rect(box, fill, outline=None, width=1):
    d.rectangle(tuple(int(v*S) for v in box), fill=fill, outline=outline, width=width*S)
def line(points, color, width=2):
    d.line([(x*S,y*S) for x,y in points], fill=color, width=width*S)
def text(x,y,t,size=20,bold=False,color=ink):
    d.text((x*S,y*S), t, font=font(size,bold), fill=color)
for x in range(0,1200,40): line([(x,385),(x,630)], '#E7E2D7',1)
for y in range(385,630,40): line([(0,y),(1200,y)], '#E7E2D7',1)
rect((60,49,104,93),ink)
rect((56,45,100,89),blue,ink,2)
text(68,46,'g',31,True,'#FFFFFF')
text(118,52,'BUILT BY AN OPS PERSON, LEARNING WITH AI',17,True)
text(56,125,'How your code',78,True)
text(56,211,'goes live.',78,True)
text(60,323,'Understand what happens after you say yes to your AI.',25)
line([(87,504),(360,504),(403,466),(655,466),(699,504),(1107,504)], blue,7)
line([(87,527),(1107,527)], '#4A52E0',4)
for x,label,sub,color in [(60,'YOUR COMPUTER','Edit + commit',blue),(380,'GITHUB','Push + review','#4A52E0'),(700,'VERCEL','Preview + deploy',purple)]:
    rect((x+5,401,x+261,473),ink)
    rect((x,396,x+256,468),'#FBF9F4',ink,2)
    text(x+17,408,label,21,True,color)
    text(x+17,438,sub,17)
d.polygon([(1070*S,480*S),(1092*S,502*S),(1070*S,524*S),(1048*S,502*S)], fill=blue, outline=ink,width=3*S)
text(1023,540,'LIVE',22,True)
text(60,577,'ONE CHANGE. TEN STEPS. THE WHOLE JOURNEY.',18,True)
im.resize((1200,630),Image.Resampling.LANCZOS).save(ROOT/'public/social-preview.png',optimize=True)
