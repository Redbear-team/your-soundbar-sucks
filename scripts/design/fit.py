import sys
from PIL import ImageFont
font = sys.argv[1]
def ink(text, wt, size=200):
    f = ImageFont.truetype(font, size); f.set_variation_by_axes([wt])
    l, t, r, b = f.getbbox(text)
    return (r - l) / size
SAMPLES = {
 'display(800)': [('Your',84,800),('soundbar',174,800),('suuucks.',160,800)],
 'headline(800)': [('You bought a',150,800),('the sound but',158,800),('let’s be honest,',170,800),('is doing a lousy',176,800),('Don’t take our',161,800),('few questions.',168,800),('We think that’s',172,800),('We’re sorry',133,800)],
 'eyebrow(700)': [('Sorry. Somebody',108,700),('needs to say it.',93,700)],
 'eyebrow(800)': [('Sorry. Somebody',108,800),('needs to say it.',93,800)],
 'link(700)': [('Why it sucks',79,700),('See how the',75,700),('system works',87,700)],
 'link(800)': [('Why it sucks',79,800),('See how the',75,800),('system works',87,800)],
 'body(700)': [('One box, one cord, done before',196,700),('stapled along the baseboard. So',199,700),('kickoff. Your friend’s real',155,700)],
 'body(600)': [('One box, one cord, done before',196,600),('stapled along the baseboard. So',199,600)],
 'subhead(700)': [('You bought a soundbar',143,700),('because it was easy install,',168,700),('not becuase of the sound.',160,700)],
 'subhead2(700)': [('One receiver per speaker.',148,700),('start to finish, in one sitting.',162,700),('That’s the whole system,',144,700)],
 'small(400)': [('Your soundbar can only cover 21 degrees. A two',197,400)],
 'small(500)': [('Your soundbar can only cover 21 degrees. A two',197,500)],
 'stat(800)': [('0 for 2',69,800),('6 for 6',67,800),('breaking up.',106,800),('The bar is',83,800)],
 'source(700)': [('BBC R&D, 2016',64,700),('AES Convention, 1999',95,700),('The Soundbar Aisle, 2026',109,700)],
 'faq(700)': [('Are speakers better',114,700),('Do I need new speakers?',141,700),('Where do I get it?',102,700),('Do I have to run wire',118,700)],
}
for k, rows in SAMPLES.items():
    sizes = [w / ink(t, wt) for t, w, wt in rows]
    print(f"{k:15s} sizes={[round(s,2) for s in sizes]} avg={sum(sizes)/len(sizes):.2f}")
