import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("deadlift")
s.camera((2.7, 1.7, 1.45), (0, 0.1, 0.75), 42)
bar = s.barbell()
for side, sign in (("L", 1), ("R", -1)):
    s.ik("arm", side, (sign * 0.45, 0.6, 1.0), parent=bar, pole_bone="chest").location = (sign * 0.24, 0.0, 0.01)
    s.ik("leg", side, (sign * 0.3, -1.2, 0.55)).location = (sign * 0.16, 0.05, 0.085)
s.planted_feet()
s.pose(0, pelvis=((0, 0.32, 0.58), (60, 0, 0)), bones={**s.grip(hand=(0, 0, 0)), "head": (-25, 0, 0)}, objects={bar: (0, -0.08, 0.225)})
s.pose(1, pelvis=((0, 0.02, 0.88), (0, 0, 0)), bones={"head": (0, 0, 0)}, objects={bar: (0, -0.11, 0.73)})
s.run()
