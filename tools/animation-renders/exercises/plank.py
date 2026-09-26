import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("plank")
s.camera((2.5, -1.0, 0.6), (0, 0.15, 0.25), 40)
s.box((0, 0.2, 0.01), (0.9, 2.0, 0.02), "dark", bevel=0.2)
for side, sign in (("L", 1), ("R", -1)):
    s.ik("arm", side, (sign * 0.3, -0.35, -0.6)).location = (sign * 0.10, -0.66, 0.06)
    s.ik("leg", side, (sign * 0.3, 0.8, -0.8)).location = (sign * 0.12, 0.90, 0.12)
s.planted_feet()
prone = (78, 0, 0)
toes = {"L": (-70, 0, 0), "R": (-70, 0, 0)}
s.pose(0, pelvis=((0, 0.08, 0.30), prone), bones={"head": (-10, 0, 0), **s.both("hand", (0, 0, 0)), **s.both("fingers", (10, 0, 0))}, foot_tilt=toes)
s.pose(1, pelvis=((0, 0.08, 0.305), prone))
s.run()
