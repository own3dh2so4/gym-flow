import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("push-up")
s.camera((2.3, -1.1, 0.85), (0, 0.3, 0.3), 40)
s.box((0, 0.3, 0.01), (0.9, 2.0, 0.02), "dark", bevel=0.2)
for side, sign in (("L", 1), ("R", -1)):
    s.ik("arm", side, (sign * 0.7, 0.3, 0.9), pole_bone="chest").location = (sign * 0.22, -0.26, 0.05)
    s.ik("leg", side, (sign * 0.3, 0.7, -0.8)).location = (sign * 0.10, 0.94, 0.12)
s.planted_feet()
toes = {"L": (80, 0, 0), "R": (80, 0, 0)}
s.pose(0, pelvis=((0, 0.20, 0.42), (68, 0, 0)), bones={"head": (-8, 0, 0), **s.both("hand", (-60, 0, 0)), **s.both("fingers", (-10, 0, 0))}, foot_tilt=toes)
s.pose(1, pelvis=((0, 0.144, 0.204), (84, 0, 0)))
s.run()
