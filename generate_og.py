from PIL import Image, ImageDraw, ImageFont
import os

project_root = r"C:\Users\MY PC\Documents\trae_projects\4d data\mok-car-rental"
public_dir = os.path.join(project_root, "public")

# Try to load a bold font, fallback to default
try:
    font_bold = ImageFont.truetype(os.path.join(project_root, "fonts", "arialbd.ttf"), 48)
except:
    try:
        font_bold = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 48)
    except:
        font_bold = ImageFont.load_default()

try:
    font_regular = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 28)
except:
    font_regular = font_bold

try:
    font_small = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 20)
except:
    font_small = font_bold


def create_og_image(filename, title, subtitle, description=None):
    img = Image.new("RGB", (1200, 630), "#1a1a2e")
    draw = ImageDraw.Draw(img)

    # Subtle gradient
    for y in range(630):
        r = int(26 + (y / 630) * 15)
        g = int(26 + (y / 630) * 10)
        b = int(46 + (y / 630) * 30)
        draw.line(((0, y), (1200, y)), fill=(r, g, b))

    # Gold accent lines
    draw.rectangle([0, 200, 1200, 203], fill="#c9a84c")
    draw.rectangle([0, 427, 1200, 427], fill="#c9a84c")

    # Title
    draw.text((600, 180), title, fill="white", font=font_bold, anchor="mt")
    # Subtitle
    draw.text((600, 250), subtitle, fill="#c9a84c", font=font_regular, anchor="mt")

    if description:
        draw.text((600, 310), description, fill="#b0b0b0", font=font_small, anchor="mt")

    # CTA
    draw.text((600, 500), "www.mokcarrental.com", fill="white", font=font_regular, anchor="mt")

    outpath = os.path.join(public_dir, filename)
    img.save(outpath, "JPEG", quality=90)
    print(f"Created {filename} at {outpath}")


# Homepage OG image
create_og_image(
    "og-home.jpg",
    "Mok Car Rental",
    "Affordable Car Rental Johor Bahru",
    "Premium fleet • Singapore customers welcome • Airport delivery",
)

# Second OG image (for internal pages / Twitter card fallback)
create_og_image(
    "og-image.jpg",
    "Mok Car Rental",
    "Our Fleet",
)

print("Done!")
