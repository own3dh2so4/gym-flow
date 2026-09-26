import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

import math  # noqa: E402

s = Scene("calf-raise")
s.camera((2.3, 2.1, 1.25), (0, -0.05, 0.75), 42)
s.box((0, -0.10, 0.05), (0.6, 0.24, 0.10), "dark")
for x in (-0.32, 0.32):
    s.box((x, -0.45, 0.6), (0.05, 0.05, 1.2))
s.cylinder((0, -0.45, 1.1), 0.02, 0.7, (0, 90, 0))
rail = s.empty("rail", (0, -0.45, 1.1))
BALL = (0.19, -0.08, 0.025)
VEC = (0.125, 0.06)


def ankle(sign, angle):
    y = VEC[0] * math.cos(math.radians(angle)) - VEC[1] * math.sin(math.radians(angle))
    z = VEC[0] * math.sin(math.radians(angle)) + VEC[1] * math.cos(math.radians(angle))
    return (sign * 0.165, BALL[1] + y, BALL[2] + z + 0.10)


for side, sign in (("L", 1), ("R", -1)):
    s.grip_bar(side, rail, (sign * 0.24, 0, 0), (0, 1, -0.6), (sign * 0.4, 0.3, 0.8))
    s.ik("leg", side, (sign * 0.25, -1.2, 0.55))
s.planted_feet()


def pose(angle):
    left = ankle(1, angle)
    return {
        "pelvis": ((0, left[1] - 0.045, 0.90 + left[2] - 0.085), (0, 0, 0)),
        "targets": {"foot.L": left, "foot.R": ankle(-1, angle)},
        "foot_tilt": {"L": (angle, 0, 0), "R": (angle, 0, 0)},
    }


s.pose(0, **pose(-15))
s.pose(1, **pose(35))
s.run()
