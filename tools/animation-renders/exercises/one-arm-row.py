import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("one-arm-row")
s.camera((-2.6, -1.3, 1.55), (0, 0.0, 0.75), 40)
s.box((0.12, 0.05, 0.41), (0.32, 1.1, 0.08), "pad")
for y in (-0.4, 0.5):
    s.box((0.12, y, 0.19), (0.28, 0.05, 0.37))
support = s.empty("support", (0.20, -0.30, 0.46))
s.grip_bar("L", support, (0, 0, 0.012), (0, 1, 0), (0.5, 0.2, 0.8), style="flat")
bell = s.dumbbell("db.R")
bell.rotation_euler = (0, 0, 1.5708)
s.grip_bar("R", bell, (0, 0, 0), (0, 0, 1), (-0.45, 0.9, 1.5), style="dumbbell", axis=(-1, 0, 0))
s.ik("leg", "R", (-0.3, -1.2, 0.5)).location = (-0.24, 0.12, 0.085)
s.planted_feet(sides=("R",))
s.pose(0, pelvis=((0, 0.25, 0.90), (80, 0, 0)), bones={"thigh.L": (80, 0, 0), "shin.L": (-90, 0, 0), "head": (-15, 0, 0)}, objects={bell: (-0.20, -0.25, 0.33)})
s.pose(1, objects={bell: (-0.22, 0.02, 0.78)})
s.run()
