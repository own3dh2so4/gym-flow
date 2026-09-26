import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("lateral-raise")
s.camera((1.6, -3.0, 1.45), (0, 0, 1.05), 42)
s.hand_dumbbells()
s.standing_legs()
stand = ((0, 0.0, 0.90), (6, 0, 0))
s.pose(0, pelvis=stand, bones={**s.both("upperarm", (6, 0, -8)), **s.both("forearm", (14, 0, 0)), **s.grip(hand=(0, 0, 0), fingers=(95, 0, 0)), "spine": (-6, 0, 0)})
s.pose(1, bones={**s.both("upperarm", (10, 0, 68)), **s.both("forearm", (16, 0, 0))})
s.run()
