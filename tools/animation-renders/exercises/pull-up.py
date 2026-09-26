import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("pull-up")
s.camera((2.1, 2.7, 1.9), (0, 0.05, 1.45), 38)
for x in (-0.55, 0.55):
    s.box((x, 0.0, 1.25), (0.07, 0.07, 2.5))
s.cylinder((0, 0.0, 2.28), 0.018, 1.2, (0, 90, 0))
bar = s.empty("bar", (0, 0.0, 2.28))
pad = s.box((0, 0.15, 0.41), (0.46, 0.46, 0.07), "pad")
s.attach(pad, "pelvis")
post = s.box((0, 0.35, 0.2), (0.07, 0.07, 0.4), "frame")
s.attach(post, "pelvis")
for side, sign in (("L", 1), ("R", -1)):
    s.grip_bar(side, bar, (sign * 0.42, 0, 0), (0, 0.1, -1), (sign * 1.0, 0.2, 1.2))
kneeling = {**s.both("thigh", (0, 0, 0)), **s.both("shin", (-90, 0, 0)), **s.both("foot", (-30, 0, 0))}
s.pose(0, pelvis=((0, 0.0, 1.21), (4, 0, 0)), bones=kneeling)
s.pose(1, pelvis=((0, 0.0, 1.55), (0, 0, 0)))
s.run()
