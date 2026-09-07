import re

with open('book/index.html', 'r') as f:
    content = f.read()

old_text = re.compile(r'<h3>The experience of autism and psychomotor slowing</h3>.*?on my own terms\.</p>', re.DOTALL)

new_text = r"""<h3>The experience of autism and psychomotor slowing</h3>
<p>People talk about the autism spectrum like it's a list of deficits — like it's just missing social cues or not making eye contact. For me, it is that <em>input machine</em>. It's seeing the entire system at once. It's why I can co-design a filesystem or run global infrastructure, but why a noisy room or forced social performance feels like a physical assault.</p>
<p>Now, combine that autistic input machine with psychomotor slowing. I can design and build amazing things—<em>very</em> amazing things—fully formed in my head, even if my processing time is a bit delayed. And here's the funny part: I can type them out entirely. The code, the documentation, the 84KB essays—if it goes through a keyboard, the channel is wide open. But when it comes to <em>verbally</em> expressing those same ideas, the psychomotor deficit hits and the output mechanism slows to a crawl. The bridge between the incredible things my brain is doing and my physical ability to speak them out loud just... jams. </p>
<p>It is absolutely infuriating. You have a supercomputer running in your head, but you're forced to verbally communicate the results through a dial-up connection. And because the world only hears the dial-up speed of your speech, they assume that's how fast your brain is working. </p>
<p>The world expects someone like me to fit into its specific, neurotypical boxes — to produce on a timer, to perform the exact right social rituals, to communicate exactly the way everyone else does. But when you are just <em>different</em>, the world interprets that difference as a failure or a behavior problem. It's not a failure. It's an operating system that wasn't built for their hardware.</p>
<p>I don't need to be fixed, and I don't need to be managed. All I need is the opportunity to excel in my own way. When you stop forcing a systems thinker to perform like a socialite, you get AcreetionOS. You get the architecture. I just need the space to run my own code, on my own terms.</p>"""

content = old_text.sub(new_text, content)

with open('book/index.html', 'w') as f:
    f.write(content)
