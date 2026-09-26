import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("leg-extension")
s.camera((2.5, -1.8, 1.25), (0, -0.2, 0.7), 40)
s.seat(top=0.52, depth=0.46, back=(0.62, 12))
for side, sign in (("L", 1), ("R", -1)):
    s.ik("arm", side, (sign * 0.5, 0.4, 0.4), pole_bone="chest").location = (sign * 0.26, 0.05, 0.54)
    s.box((sign * 0.26, 0.05, 0.53), (0.03, 0.14, 0.03), "dark")
pads = []
for side, sign in (("L", 1), ("R", -1)):
    pad = s.cylinder((sign * 0.145, -0.035, 0.16), 0.045, 0.16, (0, 90, 0), "pad")
    s.attach(pad, f"shin.{side}")
    pads.append(pad)
arm = s.box((0.30, -0.02, 0.30), (0.03, 0.05, 0.42), "frame")
s.attach(arm, "shin.L")
s.box((0.30, -0.02, 0.48), (0.05, 0.05, 0.05), "dark")
seated = ((0, 0.02, 0.62), (-6, 0, 0))
legs_bent = {**s.both("thigh", (90, 0, 0)), **s.both("shin", (-88, 0, 0)), **s.both("foot", (-10, 0, 0))}
s.pose(0, pelvis=seated, bones={**legs_bent, **s.grip(hand=(0, 90, 0))})
s.pose(1, bones={**s.both("shin", (-8, 0, 0))})
s.run()
