import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import bpy  # noqa: E402
from lib import Scene  # noqa: E402

s = Scene("triceps")
s.camera((2.7, -1.2, 1.5), (0, -0.2, 1.15), 40)
s.box((0, -0.62, 1.15), (0.30, 0.25, 2.3))
rope = s.empty("rope")
for side, sign in (("L", 1), ("R", -1)):
    s.ik("arm", side, (sign * 0.35, 0.8, 1.0), pole_bone="chest")
    s.hold(s.rope_end(f"rope.{side}"), side, "rope")
s.standing_legs()
s.targets["rope"] = rope
for side in ("L", "R"):
    s.cable(rope, bpy.data.objects[f"rope.{side}.tip"], 0.011)
s.cable((0, -0.48, 2.2), rope)
s.pose(0, pelvis=((0, 0.03, 0.89), (10, 0, 0)), targets={"hand.L": (0.07, -0.30, 1.22), "hand.R": (-0.07, -0.30, 1.22), "rope": (0, -0.33, 1.30)})
s.pose(1, targets={"hand.L": (0.13, -0.22, 0.80), "hand.R": (-0.13, -0.22, 0.80), "rope": (0, -0.24, 0.92)})
s.run()
