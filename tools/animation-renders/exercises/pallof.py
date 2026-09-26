import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("pallof")
s.camera((1.9, -2.7, 1.7), (0.3, -0.25, 1.1), 38)
s.box((1.25, -0.25, 1.0), (0.25, 0.30, 2.0))
handle = s.empty("handle")
s.moving.add(handle)
s.box((0, 0, 0), (0.03, 0.03, 0.12), "dark", parent=handle)
for side, sign in (("L", 1), ("R", -1)):
    s.ik("arm", side, (sign * 0.6, 0.3, 0.7), parent=handle, pole_bone="chest").location = (sign * 0.03, 0.02, 0.0)
    s.ik("leg", side, (sign * 0.35, -1.2, 0.55)).location = (sign * 0.22, 0.045, 0.085)
s.planted_feet()
s.cable((1.12, -0.25, 1.22), handle)
s.pose(0, pelvis=((0, 0.02, 0.84), (4, 0, 0)), bones=s.grip(hand=(0, 90, 0)), objects={handle: (0, -0.22, 1.22)})
s.pose(1, objects={handle: (0, -0.62, 1.24)})
s.run()
