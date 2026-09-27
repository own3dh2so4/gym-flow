import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("split-squat")
s.camera((2.9, -1.3, 1.35), (0, 0.15, 0.75), 40)
s.bench((0, 0.78), 0.9, top=0.45, width=0.32)
s.hand_dumbbells()
s.ik("leg", "L", (0.2, -1.2, 0.5)).location = (0.13, -0.22, 0.085)
s.ik("leg", "R", (-0.2, 0.9, -0.6)).location = (-0.12, 0.64, 0.53)
s.planted_feet()
arms = {**s.both("upperarm", (2, 0, -12)), **s.both("forearm", (6, 0, 0))}
s.pose(0, pelvis=((0, 0.11, 0.83), (8, 0, 0)), bones=arms, foot_tilt={"R": (125, 0, 0)})
s.pose(1, pelvis=((0, 0.17, 0.55), (14, 0, 0)))
s.run()
