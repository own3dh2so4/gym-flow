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
    bells[side] = s.dumbbell(f"db.{side}")
    s.grip_bar(side, bells[side], (0, 0, 0), (0, 0.1, -1), (sign * 0.9, 0.2, 0.7), style="dumbbell")
seated = ((0, 0.04, 0.55), (-4, 0, 0))
s.pose(0, pelvis=seated, objects={bells["L"]: (0.30, 0.0, 1.17), bells["R"]: (-0.30, 0.0, 1.17)})
s.pose(1, objects={bells["L"]: (0.15, -0.01, 1.66), bells["R"]: (-0.15, -0.01, 1.66)})
s.run()
