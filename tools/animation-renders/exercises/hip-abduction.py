import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("hip-abduction")
s.camera((1.5, -2.6, 1.55), (0, -0.1, 0.62), 40)
s.seat(top=0.50, depth=0.46, back=(0.62, 10))
for side, sign in (("L", 1), ("R", -1)):
    handle = s.empty(f"seat_handle.{side}", (sign * 0.27, 0.05, 0.51))
    s.cylinder((sign * 0.27, 0.05, 0.51), 0.016, 0.16, (90, 0, 0), "dark")
    s.grip_bar(side, handle, (0, 0, 0), (0, 0, 1), (sign * 0.5, 0.4, 0.4), style="handle", axis=(0, 1, 0))
    pad = s.cylinder((sign * 0.215, -0.01, 0.54), 0.05, 0.16, (0, 0, 0), "pad")
    s.attach(pad, f"thigh.{side}")
seated = ((0, 0.02, 0.60), (-6, 0, 0))
s.pose(0, pelvis=seated, bones={**s.both("thigh", (90, 0, 4)), **s.both("shin", (-90, 0, 0))})
s.pose(1, bones=s.both("thigh", (90, 0, 34)))
s.run()
