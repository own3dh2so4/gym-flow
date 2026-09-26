import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("hip-thrust")
s.camera((2.2, 1.8, 0.95), (0, 0.15, 0.4), 40)
s.box((0, 0.80, 0.21), (0.9, 0.35, 0.42), "pad", bevel=0.08)
bar = s.barbell()
bar.location = (0, -0.16, 0.86)
s.attach(bar, "pelvis")
for side, sign in (("L", 1), ("R", -1)):
    s.ik("arm", side, (sign * 0.6, 0.4, 1.4), parent=bar, pole_bone="chest").location = (sign * 0.34, 0.0, 0.0)
    s.ik("leg", side, (sign * 0.3, -1.3, 1.0)).location = (sign * 0.20, -0.40, 0.085)
s.planted_feet()
s.pose(0, pelvis=((0, 0.14, 0.24), (-55, 0, 0)), bones={**s.grip(hand=(0, 0, 0)), "head": (30, 0, 0)})
s.pose(1, pelvis=((0, 0.05, 0.53), (-90, 0, 0)), bones={"head": (45, 0, 0)})
s.run()
