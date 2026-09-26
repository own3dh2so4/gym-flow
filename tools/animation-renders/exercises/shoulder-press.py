import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("shoulder-press")
s.camera((1.9, -2.7, 1.5), (0, 0, 1.1), 42)
s.seat(back=(0.75, 8))
s.seated_legs()
bells = {}
for side, sign in (("L", 1), ("R", -1)):
    target = s.ik("arm", side, (sign * 0.9, 0.2, 0.7), pole_bone="chest")
    bell = s.dumbbell(f"db.{side}", axis="x")
    bell.parent = target
    bell.location = (0, -0.02, 0.05)
    s.moving.discard(bell)
seated = ((0, 0.04, 0.55), (-4, 0, 0))
s.pose(0, pelvis=seated, bones=s.grip(hand=(0, -90, 0)), targets={"hand.L": (0.30, 0.0, 1.10), "hand.R": (-0.30, 0.0, 1.10)})
s.pose(1, targets={"hand.L": (0.15, -0.01, 1.60), "hand.R": (-0.15, -0.01, 1.60)})
s.run()
