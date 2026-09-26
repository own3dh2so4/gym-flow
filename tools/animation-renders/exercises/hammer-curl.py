import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("hammer-curl")
s.camera((2.9, -1.7, 1.4), (0, 0, 1.0), 45)
s.hand_dumbbells()
s.standing_legs()
stand = ((0, 0.0, 0.90), (0, 0, 0))
arms_down = {**s.both("upperarm", (4, 0, -12)), **s.both("forearm", (6, 0, 0)), **s.grip(hand=(0, 0, 0), fingers=(95, 0, 0))}
s.pose(0, pelvis=stand, bones=arms_down)
s.pose(1, bones={**s.both("upperarm", (10, 0, -12)), **s.both("forearm", (134, 0, 0))})
s.run()
