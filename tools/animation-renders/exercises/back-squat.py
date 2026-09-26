import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("back-squat")
s.camera((2.7, -2.1, 1.45), (0, 0.08, 0.86), 42)
bar = s.barbell()
bar.location = (0, 0.075, 1.45)
s.attach(bar, "chest")
for side, sign in (("L", 1), ("R", -1)):
    s.grip_bar(side, bar, (sign * 0.40, 0, 0), (0, -0.45, -1), (sign * 0.55, 0.55, 1.05))
    s.ik("leg", side, (sign * 0.24, -1.2, 0.55)).location = (sign * 0.20, 0.05, 0.085)
s.planted_feet()
s.pose(0, pelvis=((0, 0.0, 0.90), (0, 0, 0)), bones={"head": (0, 0, 0), "spine": (0, 0, 0)}, foot_tilt={"L": (0, 0, 15), "R": (0, 0, -15)})
s.pose(1, pelvis=((0, 0.17, 0.53), (38, 0, 0)), bones={"spine": (-6, 0, 0), "head": (-28, 0, 0)})
s.run()
