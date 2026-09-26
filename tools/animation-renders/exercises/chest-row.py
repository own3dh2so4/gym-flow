import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("chest-row")
s.camera((2.7, -1.0, 1.5), (0, -0.1, 0.9), 40)
s.box((0, -0.12, 0.92), (0.32, 0.75, 0.07), "pad", rotation=(-45, 0, 0))
s.box((0, 0.12, 0.35), (0.07, 0.07, 0.7))
bells = {}
for side, sign in (("L", 1), ("R", -1)):
    bells[side] = s.dumbbell(f"db.{side}")
    bells[side].rotation_euler = (0, 0, 1.5708)
    s.grip_bar(side, bells[side], (0, 0, 0), (0, 0, 1), (sign * 0.5, 0.6, 1.6), style="dumbbell", axis=(sign * 1, 0, 0))
    s.ik("leg", side, (sign * 0.25, -1.2, 0.55)).location = (sign * 0.17, 0.40, 0.085)
s.planted_feet()
s.pose(0, pelvis=((0, 0.30, 0.86), (48, 0, 0)), bones={"head": (-20, 0, 0)}, objects={bells["L"]: (0.22, -0.43, 0.38), bells["R"]: (-0.22, -0.43, 0.38)})
s.pose(1, objects={bells["L"]: (0.24, -0.12, 0.73), bells["R"]: (-0.24, -0.12, 0.73)})
s.run()
