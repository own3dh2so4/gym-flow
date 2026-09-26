import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("incline-press")
s.camera((2.5, -0.6, 2.2), (0, 0.35, 0.9), 42)
s.box((0, 0.48, 0.72), (0.30, 0.95, 0.07), "pad", rotation=(-60, 0, 0))
s.box((0, -0.12, 0.44), (0.30, 0.40, 0.07), "pad")
s.box((0, 0.10, 0.2), (0.08, 0.08, 0.4))
s.box((0, 0.62, 0.3), (0.06, 0.06, 0.6), rotation=(20, 0, 0))
for side, sign in (("L", 1), ("R", -1)):
    target = s.ik("arm", side, (sign * 0.8, 0.55, 0.40), pole_bone="chest")
    bell = s.dumbbell(f"db.{side}", axis="x")
    bell.parent = target
    bell.location = (0, 0.0, 0.05)
    s.moving.discard(bell)
    s.ik("leg", side, (sign * 0.3, -1.4, 0.8)).location = (sign * 0.22, -0.48, 0.085)
s.planted_feet()
s.pose(0, pelvis=((0, 0.02, 0.55), (-58, 0, 0)), bones={**s.grip(hand=(0, -90, 0)), "head": (18, 0, 0)},
       targets={"hand.L": (0.14, 0.40, 1.36), "hand.R": (-0.14, 0.40, 1.36)})
s.pose(1, targets={"hand.L": (0.27, 0.40, 1.00), "hand.R": (-0.27, 0.40, 1.00)})
s.run()
