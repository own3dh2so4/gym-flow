import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("dead-bug")
s.camera((2.4, -1.4, 1.5), (0, 0.15, 0.25), 40)
s.box((0, 0.2, 0.01), (0.9, 2.0, 0.02), "dark", bevel=0.2)
supine = ((0, 0.0, 0.12), (-90, 0, 0))
arms_up = {**s.both("upperarm", (85, 0, -10)), **s.both("forearm", (0, 0, 0))}
table = {**s.both("thigh", (90, 0, 0)), **s.both("shin", (-90, 0, 0))}
start = {**arms_up, **table, "head": (10, 0, 0)}
s.pose(0, pelvis=supine, bones=start)
s.pose(1, bones={"upperarm.L": (168, 0, -10), "thigh.R": (12, 0, 0), "shin.R": (-6, 0, 0)})
s.pose(2, bones=start)
s.pose(3, bones={"upperarm.R": (168, 0, 10), "thigh.L": (12, 0, 0), "shin.L": (-6, 0, 0)})
s.run()
