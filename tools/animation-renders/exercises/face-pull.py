import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("face-pull")
s.camera((2.5, 1.4, 1.9), (0, -0.3, 1.35), 38)
s.box((0, -1.05, 1.0), (0.30, 0.25, 2.0))
rope = s.empty("rope")
for side, sign in (("L", 1), ("R", -1)):
    s.ik("arm", side, (sign * 1.1, 0.3, 1.9), pole_bone="chest")
    s.ik("leg", side, (sign * 0.25, -1.2, 0.55))
s.planted_feet()
s.targets["rope"] = rope
s.cable((0, -0.92, 1.62), rope)
stance = {"foot.L": (0.16, -0.18, 0.085), "foot.R": (-0.16, 0.20, 0.085)}
s.pose(0, pelvis=((0, 0.02, 0.88), (-5, 0, 0)), bones=s.grip(hand=(0, 0, 0), fingers=(95, 0, 0)),
       targets={**stance, "hand.L": (0.06, -0.72, 1.56), "hand.R": (-0.06, -0.72, 1.56), "rope": (0, -0.74, 1.56)})
s.pose(1, targets={"hand.L": (0.20, -0.10, 1.62), "hand.R": (-0.20, -0.10, 1.62), "rope": (0, -0.18, 1.60)})
s.run()
