import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("chest-press")
s.camera((2.5, -1.9, 1.5), (0, -0.25, 1.0), 40)
s.seat(back=(0.8, 6))
s.seated_legs(feet_y=-0.46)
for x in (-0.42, 0.42):
    s.box((x, 0.28, 0.95), (0.06, 0.06, 1.9))
handles = {}
for side, sign in (("L", 1), ("R", -1)):
    target = s.ik("arm", side, (sign * 0.55, 0.55, 0.75), pole_bone="chest")
    handle = s.box((0, 0, 0), (0.035, 0.035, 0.14), "dark")
    handle.parent = target
    handle.location = (0, -0.01, 0.02)
    s.lever((sign * 0.42, 0.28, 1.85), target, 0.02)
seated = ((0, 0.05, 0.55), (-4, 0, 0))
s.pose(0, pelvis=seated, bones=s.grip(hand=(0, 90, 0)), targets={"hand.L": (0.24, -0.17, 1.10), "hand.R": (-0.24, -0.17, 1.10)})
s.pose(1, targets={"hand.L": (0.19, -0.58, 1.10), "hand.R": (-0.19, -0.58, 1.10)})
s.run()
