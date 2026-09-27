import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("incline-press")
s.camera((2.5, -0.6, 2.2), (0, 0.35, 0.9), 42)
s.box((0, 0.368, 0.597), (0.30, 0.85, 0.07), "pad", rotation=(32, 0, 0))
s.box((0, -0.10, 0.415), (0.30, 0.36, 0.07), "pad")
s.box((0, -0.05, 0.19), (0.08, 0.08, 0.38))
s.box((0, 0.42, 0.26), (0.06, 0.06, 0.60), rotation=(-25, 0, 0))
s.box((0, 0.15, 0.02), (0.08, 0.90, 0.04))
bells = {}
for side, sign in (("L", 1), ("R", -1)):
    bells[side] = s.dumbbell(f"db.{side}")
    s.grip_bar(side, bells[side], (0, 0, 0), (0, 0.15, -1), (sign * 0.8, 0.55, 0.40), style="dumbbell")
    s.ik("leg", side, (sign * 0.3, -1.4, 0.8)).location = (sign * 0.22, -0.48, 0.085)
s.planted_feet()
s.pose(0, pelvis=((0, 0.02, 0.55), (-58, 0, 0)), bones={"head": (18, 0, 0)}, objects={bells["L"]: (0.13, 0.40, 1.45), bells["R"]: (-0.13, 0.40, 1.45)})
s.pose(1, objects={bells["L"]: (0.27, 0.40, 1.08), bells["R"]: (-0.27, 0.40, 1.08)})
s.run()
