import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("lat-pulldown")
s.camera((1.9, -2.7, 1.55), (0, 0, 1.35), 38)
s.seat()
s.seated_legs(feet_y=-0.42)
s.box((0, -0.28, 0.74), (0.46, 0.12, 0.08), "pad")
s.box((0, 0.35, 1.3), (0.08, 0.08, 2.6))
s.box((0, 0.0, 2.6), (0.08, 0.75, 0.08))
bar = s.barbell(plates=False, length=1.2)
for side, sign in (("L", 1), ("R", -1)):
    s.ik("arm", side, (sign * 1.0, 0.3, 0.9), parent=bar, pole_bone="chest").location = (sign * 0.40, 0.0, 0.0)
anchor = s.empty("bar_center", parent=bar)
s.cable((0, -0.03, 2.56), anchor)
seated = ((0, 0.04, 0.55), (-10, 0, 0))
s.pose(0, pelvis=seated, bones=s.grip(hand=(0, 90, 0)), objects={bar: (0, -0.05, 1.62)})
s.pose(1, objects={bar: (0, -0.15, 1.24)})
s.run()
