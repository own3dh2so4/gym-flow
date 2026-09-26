import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("farmer-carry")
s.camera((3.0, -1.2, 1.3), (0, 0, 0.9), 42)
s.hand_dumbbells()
for side, sign in (("L", 1), ("R", -1)):
    s.ik("leg", side, (sign * 0.2, -1.2, 0.55))
s.planted_feet()
arms = {**s.both("upperarm", (0, 0, -14)), **s.both("forearm", (4, 0, 0))}


def step(front, back, lift, height):
    return {
        "pelvis": ((0, 0.0, height), (2, 0, 0)),
        "targets": {front[0]: (front[1] * 0.12, -0.22, 0.10), back[0]: (back[1] * 0.12, 0.22 - lift, 0.10 + lift * 0.6)},
        "foot_tilt": {front[0][-1]: (-12, 0, 0), back[0][-1]: (25, 0, 0)},
    }


s.pose(0, bones=arms, **step(("foot.L", 1), ("foot.R", -1), 0.0, 0.875))
s.pose(1, **{"pelvis": ((0, 0.0, 0.895), (2, 0, 0)), "targets": {"foot.L": (0.12, 0.0, 0.085), "foot.R": (-0.12, -0.02, 0.2)},
             "foot_tilt": {"L": (0, 0, 0), "R": (-10, 0, 0)}})
s.pose(2, **step(("foot.R", -1), ("foot.L", 1), 0.0, 0.875))
s.pose(3, **{"pelvis": ((0, 0.0, 0.895), (2, 0, 0)), "targets": {"foot.R": (-0.12, 0.0, 0.085), "foot.L": (0.12, -0.02, 0.2)},
             "foot_tilt": {"R": (0, 0, 0), "L": (-10, 0, 0)}})
s.run()
