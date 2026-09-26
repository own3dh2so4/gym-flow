import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("cable-row")
s.camera((2.8, -0.15, 1.3), (0, -0.35, 0.6), 38)
s.box((0, 0.1, 0.30), (0.32, 1.3, 0.06), "pad")
s.box((0, 0.1, 0.13), (0.10, 1.1, 0.26))
s.box((0, -0.70, 0.22), (0.46, 0.06, 0.36), "dark", rotation=(-20, 0, 0))
s.box((0, -1.02, 0.9), (0.40, 0.25, 1.8))
handle = s.empty("handle")
s.moving.add(handle)
s.box((0, 0, 0), (0.18, 0.03, 0.03), "dark", parent=handle)
for side, sign in (("L", 1), ("R", -1)):
    s.ik("arm", side, (sign * 0.35, 0.6, 0.4), parent=handle, pole_bone="chest").location = (sign * 0.07, 0.0, 0.0)
    s.ik("leg", side, (sign * 0.25, -0.9, 1.2)).location = (sign * 0.13, -0.62, 0.30)
s.planted_feet()
s.cable((0, -0.86, 0.28), handle)
seat = (0, 0.10, 0.43)
s.pose(0, pelvis=(seat, (16, 0, 0)), bones=s.grip(hand=(0, 0, 0)), objects={handle: (0, -0.60, 0.74)},
       foot_tilt={"L": (-70, 0, 0), "R": (-70, 0, 0)})
s.pose(1, pelvis=(seat, (-3, 0, 0)), objects={handle: (0, -0.16, 0.76)})
s.run()
