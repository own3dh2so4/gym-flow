import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

import math  # noqa: E402

s = Scene("bike")
s.camera((2.6, -1.0, 1.35), (0, -0.2, 0.8), 40)
CRANK = (0, -0.28, 0.33)
RADIUS = 0.17
s.box((0, 0.08, 0.88), (0.16, 0.26, 0.05), "dark")
s.rod((0, 0.05, 0.86), CRANK, 0.03)
s.rod(CRANK, (0, -0.72, 0.36), 0.03)
s.rod((0, -0.72, 0.36), (0, -0.62, 1.12), 0.03)
s.box((0, -0.60, 1.12), (0.46, 0.04, 0.04), "dark")
s.cylinder((0, -0.66, 0.36), 0.24, 0.06, (0, 90, 0), "frame", vertices=64)
s.box((0, -0.25, 0.03), (0.5, 1.2, 0.06), "dark")
s.cylinder(CRANK, 0.06, 0.05, (0, 90, 0), "dark")
for side, sign in (("L", 1), ("R", -1)):
    s.ik("leg", side, (sign * 0.25, -1.4, 1.2))
    s.ik("arm", side, (sign * 0.5, 0.2, 0.6), pole_bone="chest").location = (sign * 0.21, -0.60, 1.12)
s.planted_feet()


def pedal(angle, sign):
    radians = math.radians(angle)
    return (sign * 0.16, CRANK[1] + RADIUS * math.sin(radians) + 0.06, CRANK[2] + RADIUS * math.cos(radians) + 0.07)


for index, angle in enumerate(range(0, 360, 45)):
    kwargs = {
        "targets": {"foot.L": pedal(angle, 1), "foot.R": pedal(angle + 180, -1)},
        "foot_tilt": {"L": (12 * math.cos(math.radians(angle)) - 8, 0, 0), "R": (-12 * math.cos(math.radians(angle)) - 8, 0, 0)},
    }
    if index == 0:
        kwargs.update(pelvis=((0, 0.08, 0.98), (32, 0, 0)), bones={**s.grip(hand=(0, 90, 0)), "head": (-22, 0, 0)})
    s.pose(index, **kwargs)
s.run()
