import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("pallof")
s.camera((1.9, -2.7, 1.7), (0.3, -0.25, 1.1), 38)
s.box((1.25, -0.25, 1.0), (0.25, 0.30, 2.0))
handle = s.handle("handle", 0.12)
handle.rotation_euler = (0, 1.5708, 0)
s.grip_bar("R", handle, (-0.03, 0, 0), (0, 1, 0), (-0.6, 0.3, 0.7), style="handle", axis=(1, 0, 0))
s.grip_bar("L", handle, (0.03, 0, 0), (0, 1, 0), (0.6, 0.3, 0.7), style="handle", axis=(1, 0, 0))
for side, sign in (("L", 1), ("R", -1)):
    s.ik("leg", side, (sign * 0.35, -1.2, 0.55)).location = (sign * 0.22, 0.045, 0.085)
s.planted_feet()
s.cable((1.12, -0.25, 1.22), handle)
s.pose(0, pelvis=((0, 0.02, 0.84), (4, 0, 0)), objects={handle: (0, -0.26, 1.20)})
s.pose(1, objects={handle: (0, -0.66, 1.22)})
s.run()
