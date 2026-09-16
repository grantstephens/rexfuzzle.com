---
title: DIY Starlight
slug: diy-starlight
date: 2021-10-31T19:48:59.000Z
tags:
  - esp32
  - star
  - arduino
  - lights
description: >-
  So I decided to build my own stars over my bed. They're great for going to
  sleep with and they're good at waking you up.
featureImage: /assets/images/diy-starlight/PA310034a.jpg
---

So with light pollution being what it is, I decided to make my own stars. Here is a horrible video of it, because as it turns out its quite hard to film fake stars:

<figure class="kg-card kg-embed-card"><iframe width="200" height="113" src="https://www.youtube.com/embed/-s43WFIrOVU?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" loading="lazy"></iframe></figure>

TL;DR: ESP32 running esphome drives a IS31FL3731 connected to a matrix of charlieplexed LEDs.

So first things first- LEDs. I wanted some really small ones, but can't solder things that small. Luckily AliExpress has a solution- [these ones](https://www.aliexpress.com/item/1005002254905113.html?spm=a2g0s.9042311.0.0.4b664c4dwgnrkV). Basically they're 0603 LEDs that are soldered to some coated wires and dipped in resin to protect them. This makes them very easy to solder to the grid. Speaking of, I needed some coated wire too- AliExpress sent me [this](https://www.aliexpress.com/item/32800422604.html?spm=a2g0s.9042311.0.0.154b4c4dsbGcac)\- 100m of 0.5mm enamelled wire. I also learnt that the coating on wires can be burnt off when soldering it, so no need to struggle getting the coating off.

Now we have the lights, but we need a way of controlling them- I chose an esp32 based board, specifically the Lolin D32- these can be had for a couple of bucks and can do a lot more than just drive a some LEDs. Unfortunately they can't quite drive all the LEDs on their own, so I got an IS32FL3731- well I got the Adafruit version of it- [this](https://www.adafruit.com/product/2946) one to be precise. It talks to the esp32 via SPI so that's nice and simple.

Now this board uses charlieplexing to drive the LEDs- let me explain what that means. It allows you to control many more LEDs that you have wires- the exact ratio is n\*(n-1) where n is the number of output wires you have. It takes advantage of the fact that LEDs only allow current to flow in one direction. The simplest example is if you have two wires, you can connect two LEDs between them, in opposite orientations, i.e. the anodes and cathodes on the opposite sides, then by switching the polarity of the current applied to the two wires you can switch each LED on individually. [Wikipeadia](https://en.wikipedia.org/wiki/Charlieplexing) has a lot more detail if you're interested.

So now we've got all the bits and pieces, it is time to solver up a grid. I chose to not try and do this while it was suspended above my bed and instead made a frame on the living room floor and spent a weekend on my knees trying not to burn the carpet. Here is a closeup of the result:

![Close-up of thin enamelled copper wires soldered together at a crossing point, part of the charlieplexed LED grid](/assets/images/diy-starlight/PA310033-1.jpg)

Once all the hardware was done it was time to look at the software. I have an instance of [home assistant](https://home-assistant.io/) running and it works with [esphome](https://esphome.io/) devices. The problem is that esphome does not support the IS32FL3731 and couple that with the fact that I want to use it as a light and not a display meant that I got antiquated with custom components in esphome. The code is all available here, but I'll run through the basics here.

I wanted to creating a constant twinkling effect- that turned out to be fading one LED on whilst fading another one off. I chose to have 50% of them on at any one time and it choses which two to swap randomly which is quite soothing, but also fun to watch. I used the brightness control to limit the brightness of all the LEDs that are on, i.e. if the brightness is set at 50% then all of the LEDs that are on are at 50%. This could be improved in the future to have some dimmer leds to mix things up a bit.

The custom light component isn't quite set up to do this and the addressable one proved impossible to adapt to the IS32FL3731 so I ended up putting all the logic in the [loop section](https://gist.github.com/grantstephens/b16a3e88423135df2b93e54890397b2d#file-starlight-h-L76) of the component. The first couple of iterations of the software took too long to loop and caused all types of problems with the connection to home assistant and OTA updates. Eventually, thanks to some help from the esphome discord, I limited the time spent in the loop as much as possible and it all worked.

I haven't included the code in this post, but it is all available [here](https://gist.github.com/grantstephens/b16a3e88423135df2b93e54890397b2d) and I've placed links to certain sections through this post.

The loop runs about every 16ms and I can change about 2 LEDs in this time with everything else that is going on. This is not a lot and so brightness changes take a while, but I think it adds to the aesthetic and there aren't any bright flashes or sudden changes which is nice.

There are a couple of things that have to be added to the config yaml which are not obvious- the [libraries](https://gist.github.com/grantstephens/b16a3e88423135df2b93e54890397b2d#file-starlight-yaml-L7-L11) are one, especially unexpected ones. The [lambda section](https://gist.github.com/grantstephens/b16a3e88423135df2b93e54890397b2d#file-starlight-yaml-L21-L25) is also a bit strange. Finally the default gamma correction does not play nicely with the brightness adjustments and so that is [set to 1](https://gist.github.com/grantstephens/b16a3e88423135df2b93e54890397b2d#file-starlight-yaml-L30).

Finally I built in some transitions into home assistant. This makes for a very nice wake up light. The automation simply activates the scene with a 30s transition time.

All in all this was a fun project and is great to watch the the stars twinkle and try to predict the next one to change. Writing some C code again for a change was also great fun and got a painful reminder that uint8s range is from -128 to 128 and they wrap around- obviously, but not so much until you print them out to try and debug it.

Be Wishing on a Star
