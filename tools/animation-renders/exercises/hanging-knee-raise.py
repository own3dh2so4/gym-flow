import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("hanging-knee-raise")
s.camera((2.6, -1.7, 1.55), (0, 0.0, 1.3), 40)
for x in (-0.55, 0.55):
    s.box((x, 0.0, 1.25), (0.07, 0.07, 2.5))
s.cylinder((0, 0.0, 2.26), 0.018, 1.2, (0, 90, 0))
bar = s.empty("bar", (0, 0.0, 2.26))
for side, sign in (("L", 1), ("R", -1)):
    s.grip_bar(side, bar, (sign * 0.25, 0, 0), (0, 0.1, -1), (sign * 0.9, 0.3, 1.4))
s.pose(0, pelvis=((0, 0.0, 1.14), (0, 0, 0)), bones={**s.both("thigh", (0, 0, 0)), **s.both("shin", (-4, 0, 0))})
s.pose(1, pelvis=((0, -0.04, 1.17), (-12, 0, 0)), bones={**s.both("thigh", (100, 0, 0)), **s.both("shin", (-95, 0, 0))})
s.run()
