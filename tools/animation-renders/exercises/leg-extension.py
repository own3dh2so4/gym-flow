import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("leg-extension")
s.camera((2.5, -1.8, 1.25), (0, -0.2, 0.7), 40)
s.seat(top=0.52, depth=0.46, back=(0.62, 12))
for side, sign in (("L", 1), ("R", -1)):
    handle = s.empty(f"seat_handle.{side}", (sign * 0.27, 0.05, 0.53))
    s.cylinder((sign * 0.27, 0.05, 0.53), 0.016, 0.16, (90, 0, 0), "dark")
    s.grip_bar(side, handle, (0, 0, 0), (0, 0, 1), (sign * 0.5, 0.4, 0.4), style="handle", axis=(0, 1, 0))
for side, sign in (("L", 1), ("R", -1)):
    pad = s.cylinder((sign * 0.145, -0.035, 0.16), 0.045, 0.16, (0, 90, 0), "pad")
    s.attach(pad, f"shin.{side}")
arm = s.box((0.30, -0.02, 0.30), (0.03, 0.05, 0.42), "frame")
s.attach(arm, "shin.L")
s.box((0.30, -0.02, 0.48), (0.05, 0.05, 0.05), "dark")
seated = ((0, 0.02, 0.62), (-6, 0, 0))
s.pose(0, pelvis=seated, bones={**s.both("thigh", (90, 0, 0)), **s.both("shin", (-88, 0, 0)), **s.both("foot", (-10, 0, 0))})
s.pose(1, bones={**s.both("shin", (-8, 0, 0))})
s.run()
