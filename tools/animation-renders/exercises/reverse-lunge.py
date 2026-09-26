import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("reverse-lunge")
s.camera((2.9, -1.2, 1.35), (0, 0.2, 0.75), 40)
s.hand_dumbbells()
s.ik("leg", "L", (0.2, -1.2, 0.5))
s.ik("leg", "R", (-0.2, 0.35, -0.8))
s.planted_feet()
arms = {**s.both("upperarm", (2, 0, -12)), **s.both("forearm", (6, 0, 0)), **s.grip(hand=(0, 0, 0), fingers=(95, 0, 0))}
front = (0.12, -0.05, 0.085)
s.pose(0, pelvis=((0, 0.0, 0.90), (0, 0, 0)), bones=arms, targets={"foot.L": front, "foot.R": (-0.12, 0.045, 0.085)},
       foot_tilt={"L": (0, 0, 0), "R": (0, 0, 0)})
s.pose(1, pelvis=((0, 0.24, 0.84), (4, 0, 0)), targets={"foot.R": (-0.12, 0.62, 0.13)}, foot_tilt={"R": (45, 0, 0)})
s.pose(2, pelvis=((0, 0.24, 0.51), (8, 0, 0)), targets={"foot.R": (-0.12, 0.60, 0.13)}, foot_tilt={"R": (50, 0, 0)})
s.run()
