import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("rower")
s.camera((2.9, -0.6, 1.45), (0, -0.25, 0.62), 36)
s.box((0, 0.1, 0.20), (0.14, 2.2, 0.06), "frame")
s.box((0, 0.9, 0.09), (0.10, 0.10, 0.18))
s.cylinder((0, -1.18, 0.45), 0.25, 0.14, (0, 90, 0), "dark", vertices=64)
s.box((0, -0.74, 0.30), (0.40, 0.05, 0.28), "dark", rotation=(-35, 0, 0))
seat = s.box((0, 0, 0), (0.30, 0.30, 0.05), "pad")
seat_holder = s.empty("seat")
seat.parent = seat_holder
s.moving.add(seat_holder)
handle = s.handle("handle", 0.46)
for side, sign in (("L", 1), ("R", -1)):
    s.grip_bar(side, handle, (sign * 0.14, 0, 0), (0, 1, 0), (sign * 0.35, 0.6, 0.3))
    s.ik("leg", side, (sign * 0.3, -1.0, 1.4)).location = (sign * 0.14, -0.68, 0.32)
s.planted_feet()
s.cable((0, -1.05, 0.50), handle)
feet = {"L": (-48, 0, 0), "R": (-48, 0, 0)}


def pose(seat_y, lean, hands):
    return {
        "pelvis": ((0, seat_y, 0.36), (lean, 0, 0)),
        "objects": {seat_holder: (0, seat_y + 0.02, 0.255), handle: hands},
    }


s.pose(0, bones={"head": (-10, 0, 0)}, foot_tilt=feet, **pose(-0.30, 30, (0, -1.02, 0.62)))
s.pose(1, **pose(-0.02, 30, (0, -0.76, 0.62)))
s.pose(2, **pose(0.10, -25, (0, -0.20, 0.68)))
s.pose(3, **pose(0.10, -25, (0, 0.08, 0.72)))
s.pose(4, **pose(0.10, -25, (0, -0.20, 0.68)))
s.pose(5, **pose(0.10, 30, (0, -0.64, 0.62)))
s.run()
