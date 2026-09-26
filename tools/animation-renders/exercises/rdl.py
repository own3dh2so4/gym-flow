import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("rdl")
s.camera((2.7, 1.7, 1.45), (0, 0.1, 0.8), 42)
bar = s.barbell()
for side, sign in (("L", 1), ("R", -1)):
    s.grip_bar(side, bar, (sign * 0.23, 0, 0), (0, 0.1, 1), (sign * 0.45, 0.6, 1.0))
    s.ik("leg", side, (sign * 0.3, -1.2, 0.55)).location = (sign * 0.15, 0.05, 0.085)
s.planted_feet()
s.pose(0, pelvis=((0, 0.02, 0.88), (0, 0, 0)), bones={"head": (0, 0, 0)}, objects={bar: (0, -0.10, 0.66)})
s.pose(1, pelvis=((0, 0.30, 0.84), (72, 0, 0)), bones={"head": (-10, 0, 0)}, objects={bar: (0, -0.07, 0.33)})
s.run()
