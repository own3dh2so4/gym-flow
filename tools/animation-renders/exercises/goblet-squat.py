import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("goblet-squat")
s.camera((2.7, -2.1, 1.45), (0, 0.02, 0.86), 42)
bell = s.dumbbell("goblet", axis="z")
bell.location = (0, -0.23, 1.15)
s.attach(bell, "chest")
for side, sign in (("L", 1), ("R", -1)):
    s.ik("arm", side, (sign * 0.2, -0.3, 0.4), parent=bell, pole_bone="chest").location = (sign * 0.06, 0.02, 0.03)
    s.ik("leg", side, (sign * 0.24, -1.2, 0.55)).location = (sign * 0.21, 0.05, 0.085)
s.planted_feet()

s.pose(0, pelvis=((0, 0.0, 0.90), (0, 0, 0)), bones={**s.grip(hand=(-60, 0, 0), fingers=(60, 0, 0)), "head": (0, 0, 0)},
       foot_tilt={"L": (0, 0, 18), "R": (0, 0, -18)})
s.pose(1, pelvis=((0, 0.13, 0.49), (24, 0, 0)), bones={"head": (-16, 0, 0), "spine": (-4, 0, 0)})
s.run()
