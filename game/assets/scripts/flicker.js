var flickers = [
    new NumberAnim(1),
    new NumberAnim(1),
    new NumberAnim(1),
    new NumberAnim(1),
    new NumberAnim(1),
    new NumberAnim(1),
    new NumberAnim(1),
    new NumberAnim(1),
    new NumberAnim(1),
    new NumberAnim(1)
]

// Pulse
flickers[1].playSingle(1, 0, 1, Tween.EASE_BOTH, Loop.PING_PONG_LOOP)

// Flicker
flickers[2].queue(1, 0.4)
flickers[2].queue(0, 0.1)
flickers[2].queue(0.8, 0.2)
flickers[2].queue(0.2, 0.1)
flickers[2].queue(1, 0.2)
flickers[2].queue(0, 0.1)
flickers[2].queue(0.5, 0.1)
flickers[2].queue(0.1, 0.1)
flickers[2].queue(0.6, 0.1)
flickers[2].queue(0.1, 0.1)
flickers[2].queue(0.8, 0.1)
flickers[2].queue(0, 0.4)
flickers[2].queue(1, 0.1)
flickers[2].queue(1, 1)
flickers[2].queue(0.6, 0.2)
flickers[2].queue(1, 0.1)
flickers[2].play(Loop.LOOP)

// Flicker offset
flickers[2].queue(0.1, 0.1)
flickers[2].queue(0.8, 0.1)
flickers[2].queue(0, 0.4)
flickers[2].queue(1, 0.1)
flickers[2].queue(1, 1)
flickers[2].queue(0.6, 0.2)
flickers[2].queue(1, 0.1)
flickers[2].queue(1, 0.4)
flickers[2].queue(0, 0.1)
flickers[2].queue(0.8, 0.2)
flickers[2].queue(0.2, 0.1)
flickers[2].queue(1, 0.2)
flickers[2].queue(0, 0.1)
flickers[2].queue(0.5, 0.1)
flickers[2].queue(0.1, 0.1)
flickers[2].queue(0.6, 0.1)
flickers[2].play(Loop.LOOP)
