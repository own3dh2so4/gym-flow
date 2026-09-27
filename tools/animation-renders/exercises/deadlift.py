import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("deadlift")
s.camera((2.7, 1.7, 1.45), (0, 0.1, 0.75), 42)
bar = s.barbell()
for side, sign in (("L", 1), ("R", -1)):
    s.grip_bar(side, bar, (sign * 0.20, 0, 0), (0, 0.1, 1), (sign * 0.45, 0.6, 1.0))
    s.ik("leg", side, (sign * 0.3, -1.2, 0.55)).location = (sign * 0.16, 0.05, 0.085)
s.planted_feet()
passing_knees = {"pelvis": ((0, 0.22, 0.72), (38, 0, 0)), "objects": {bar: (0, -0.09, 0.47)}}
s.pose(0, pelvis=((0, 0.30, 0.56), (58, 0, 0)), bones={"head": (-25, 0, 0)}, objects={bar: (0, -0.08, 0.225)}, via=passing_knees)
s.pose(1, pelvis=((0, 0.02, 0.88), (0, 0, 0)), bones={"head": (0, 0, 0)}, objects={bar: (0, -0.10, 0.73)}, via=passing_knees)
s.run()
