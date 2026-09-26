import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

import math  # noqa: E402

s = Scene("goblet-squat")
s.camera((2.7, -2.1, 1.45), (0, 0.02, 0.86), 42)
holder = s.empty("goblet", (0, -0.20, 1.15))
s.attach(holder, "chest")
bell = s.dumbbell("goblet_bell")
bell.parent = holder
bell.rotation_euler = (0, math.radians(90), 0)
s.moving.discard(bell)
for side, sign in (("L", 1), ("R", -1)):
    s.grip_bar(side, holder, (sign * 0.05, 0.0, 0.05), (sign * 0.35, 0.3, -1), (sign * 0.25, -0.35, 0.55), style="cup", axis=(0, -sign, 0))
    s.ik("leg", side, (sign * 0.24, -1.2, 0.55)).location = (sign * 0.21, 0.05, 0.085)
s.planted_feet()
s.pose(0, pelvis=((0, 0.0, 0.90), (0, 0, 0)), bones={"head": (0, 0, 0)}, foot_tilt={"L": (0, 0, 18), "R": (0, 0, -18)})
s.pose(1, pelvis=((0, 0.13, 0.49), (24, 0, 0)), bones={"head": (-16, 0, 0), "spine": (-4, 0, 0)})
s.run()
