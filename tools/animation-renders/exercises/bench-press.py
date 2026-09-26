import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("bench-press")
s.camera((2.4, 0.3, 2.8), (0, 1.04, 0.78), 46)
s.bench((0, 1.08), 1.2)
for x in (-0.55, 0.55):
    s.box((x, 1.72, 0.65), (0.06, 0.06, 1.30))
    s.box((x, 1.66, 1.12), (0.05, 0.10, 0.03))
    s.box((x, 1.60, 0.02), (0.10, 0.60, 0.04))
bar = s.barbell()
for side, sign in (("L", 1), ("R", -1)):
    s.grip_bar(side, bar, (sign * 0.30, 0, 0), (0, 0.1, -1), (sign * 0.75, 1.30, 0.20))
    s.ik("leg", side, (sign * 0.35, 0.40, 1.2)).location = (sign * 0.30, 0.60, 0.09)
s.planted_feet()

lying = ((0, 0.90, 0.57), (-90, 0, 0))
s.pose(0, pelvis=lying, bones={"head": (8, 0, 0)}, objects={bar: (0, 1.36, 1.10)})
s.pose(1, objects={bar: (0, 1.21, 0.735)})
s.run()
