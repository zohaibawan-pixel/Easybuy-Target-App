EasyBuy + Delivery Orders Online Dashboard
==========================================

یہ پیکج آن لائن ہوسٹنگ پر deploy کرنے کے لیے تیار کیا گیا ہے، مگر ابھی اس کا عوامی URL نہیں بنا۔ URL بنانے کے لیے آپ کے Render/GitHub اکاؤنٹ اور Meta WhatsApp Cloud API کی سیٹنگ ضروری ہے۔

فائلیں:
- public/index.html : دکاندار، روزانہ target، sales، CSV import/export اور dashboard
- server.js : محفوظ backend جو Meta WhatsApp Cloud API سے template messages بھیجتا ہے
- render.yaml : Render hosting کے لیے deployment blueprint

Render پر آن لائن کرنے کے مراحل:
1. ZIP کو extract کریں اور اس فولڈر کو اپنی GitHub repository میں upload کریں۔
2. Render.com پر اکاؤنٹ بنا کر New + Blueprint یا Web Service سے اسی repository کو connect کریں۔
3. Render کی Environment Variables میں یہ تین secrets درج کریں:
   ADMIN_API_KEY = اپنا لمبا اور منفرد admin key
   WHATSAPP_TOKEN = Meta WhatsApp Cloud API access token
   PHONE_NUMBER_ID = Meta WhatsApp Phone Number ID
   TEMPLATE_LANGUAGE_CODE = en_US یا وہ language code جو منظور شدہ template پر ہے
4. Deploy مکمل ہونے کے بعد Render آپ کو https://....onrender.com لنک دے گا۔
5. اس لنک پر dashboard کھولیں۔ API Setup میں endpoint یہ ہوگا:
   https://YOUR-APP.onrender.com/api/send-target
   Template name میں Meta-approved template کا عین نام درج کریں۔ Admin API Key والے خانے میں وہی ADMIN_API_KEY لکھیں جو Render پر set کیا تھا، پھر Save Endpoint Settings اور Test Backend Connection کریں۔

Meta template کی لازمی ترتیب:
- WhatsApp Manager میں ایک approved template بنائیں، جس کے body میں 7 variables ہوں:
  {{1}} دکان/ایجنٹ کا نام
  {{2}} EasyBuy target
  {{3}} EasyBuy sales achieved
  {{4}} EasyBuy remaining
  {{5}} Delivery Orders target
  {{6}} Delivery Orders completed
  {{7}} Delivery Orders remaining
- Template کی زبان، TEMPLATE_LANGUAGE_CODE کے عین مطابق ہونی چاہیے۔ اگر template کے variables کی ترتیب مختلف ہوئی تو پیغام غلط دکھائی دے سکتا ہے۔
- WhatsApp Business Platform کی پالیسی کے مطابق صرف رضامند recipients کو پیغام بھیجیں؛ غیر مطلوب پیغامات نہ بھیجیں۔ Template approval اور Meta account/number setup ضروری ہیں۔

اہم سکیورٹی:
- WHATSAPP_TOKEN صرف Render Environment Variables میں رکھیں؛ اسے HTML، GitHub یا کسی کو بھیجنے والے پیغام میں نہ رکھیں۔
- ADMIN_API_KEY بھی منفرد اور خفیہ رکھیں۔ Dashboard میں key اس browser tab کی memory میں رہتی ہے اور localStorage میں save نہیں ہوتی۔
- Dashboard shop list اسی browser کے localStorage میں رہتی ہے؛ دوسرے فون/براؤزر پر خودکار sync نہیں ہوتی۔ CSV Export سے backup رکھیں۔
- Send button ایک وقت میں زیادہ سے زیادہ 100 recipients بھیجتا ہے۔ Meta API کے جوابی status کو dashboard میں دیکھیں؛ submitted کا مطلب API نے request قبول کی، حتمی delivery status نہیں۔

اگر آپ کے پاس ابھی Meta WhatsApp Cloud API نہیں ہے تو dashboard deploy ہو سکتا ہے، لیکن اصل WhatsApp sending Meta setup اور approved template ہونے تک کام نہیں کرے گی۔
