import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("rear-delt")
s.camera((1.9, 2.6, 1.85), (0, -0.1, 1.2), 38)
s.seat(top=0.50, depth=0.36)
s.box((0, -0.26, 1.12), (0.30, 0.08, 0.50), "pad")
s.box((0, -0.34, 0.8), (0.08, 0.08, 1.6))
pivot = (0, -0.46, 1.50)
s.box(pivot, (0.10, 0.10, 0.10), "dark")
s.seated_legs(feet_y=-0.42)
handles = {}
for side, sign in (("L", 1), ("R", -1)):
    handles[side] = s.handle(f"handle.{side}")
    s.grip_bar(side, handles[side], (0, 0, 0), (0, 1, 0), (sign * 1.0, 0.6, 1.8), style="handle", axis=(1, 0, 0))
    s.lever(pivot, handles[side], 0.018)
s.pose(0, pelvis=((0, 0.10, 0.60), (6, 0, 0)), objects={handles["L"]: ((0.08, -0.56, 1.10), (0, 90, 0)), handles["R"]: ((-0.08, -0.56, 1.10), (0, 90, 0))})
s.pose(1, objects={handles["L"]: ((0.76, -0.05, 1.10), (0, 90, 90)), handles["R"]: ((-0.76, -0.05, 1.10), (0, 90, -90))})
s.run()
