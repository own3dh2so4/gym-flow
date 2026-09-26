import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("one-arm-row")
s.camera((-2.6, -1.3, 1.55), (0, 0.0, 0.75), 40)
s.box((0.12, 0.05, 0.41), (0.32, 1.1, 0.08), "pad")
for y in (-0.4, 0.5):
    s.box((0.12, y, 0.19), (0.28, 0.05, 0.37))
s.ik("arm", "L", (0.5, 0.2, 0.8), pole_bone="chest").location = (0.20, -0.26, 0.50)
target = s.ik("arm", "R", (-0.45, 0.9, 1.5), pole_bone="chest")
bell = s.dumbbell("db.R", axis="y")
bell.parent = target
bell.location = (0, -0.02, -0.03)
s.moving.discard(bell)
s.ik("leg", "R", (-0.3, -1.2, 0.5)).location = (-0.24, 0.12, 0.085)
s.planted_feet(sides=("R",))
s.pose(0, pelvis=((0, 0.25, 0.90), (80, 0, 0)), bones={"thigh.L": (80, 0, 0), "shin.L": (-90, 0, 0), "head": (-15, 0, 0), **s.grip(hand=(0, 0, 0), sides=("R",)), "hand.L": (-60, 0, 0)},
       targets={"hand.R": (-0.20, -0.24, 0.40)})
s.pose(1, targets={"hand.R": (-0.22, 0.02, 0.84)})
s.run()
