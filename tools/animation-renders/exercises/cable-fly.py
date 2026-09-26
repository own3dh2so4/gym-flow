import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("cable-fly")
s.camera((1.4, -3.0, 1.7), (0, 0, 1.25), 38)
for sign in (1, -1):
    s.box((sign * 1.15, 0.12, 1.05), (0.22, 0.22, 2.1))
for side, sign in (("L", 1), ("R", -1)):
    target = s.ik("arm", side, (sign * 0.9, 0.9, 1.0), pole_bone="chest")
    s.cable((sign * 1.02, 0.1, 1.95), target)
    s.ik("leg", side, (sign * 0.25, -1.2, 0.55))
s.planted_feet()
stance = {"foot.L": (0.15, -0.20, 0.085), "foot.R": (-0.15, 0.20, 0.085)}
s.pose(0, pelvis=((0, 0.03, 0.88), (12, 0, 0)), bones=s.grip(hand=(0, 0, 0), fingers=(95, 0, 0)),
       targets={**stance, "hand.L": (0.74, 0.02, 1.42), "hand.R": (-0.74, 0.02, 1.42)})
s.pose(1, targets={"hand.L": (0.06, -0.46, 1.16), "hand.R": (-0.06, -0.46, 1.16)})
s.run()
