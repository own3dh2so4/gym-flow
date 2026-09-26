import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("chest-press")
s.camera((2.5, -1.9, 1.5), (0, -0.25, 1.0), 40)
s.seat(back=(0.8, 6))
s.seated_legs(feet_y=-0.46)
for x in (-0.60, 0.60):
    s.box((x, 0.28, 0.95), (0.06, 0.06, 1.9))
handles = {}
for side, sign in (("L", 1), ("R", -1)):
    handles[side] = s.handle(f"handle.{side}")
    handles[side].rotation_euler = (0, 1.5708, 0)
    s.grip_bar(side, handles[side], (0, 0, 0), (0, 1, 0), (sign * 0.55, 0.55, 0.75), style="handle", axis=(1, 0, 0))
    top = s.empty(f"handle_top.{side}", (-0.07, 0, 0), handles[side])
    s.lever((sign * 0.60, 0.25, 1.85), top, 0.02)
seated = ((0, 0.05, 0.55), (-4, 0, 0))
s.pose(0, pelvis=seated, objects={handles["L"]: (0.24, -0.24, 1.10), handles["R"]: (-0.24, -0.24, 1.10)})
s.pose(1, objects={handles["L"]: (0.19, -0.66, 1.10), handles["R"]: (-0.19, -0.66, 1.10)})
s.run()
