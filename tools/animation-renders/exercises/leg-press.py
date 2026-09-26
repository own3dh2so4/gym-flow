import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lib import Scene  # noqa: E402

s = Scene("leg-press")
s.camera((2.7, -0.4, 1.6), (0, -0.35, 0.75), 40)
s.box((0, 0.10, 0.44), (0.44, 0.40, 0.08), "pad", rotation=(12, 0, 0))
s.box((0, 0.45, 0.72), (0.44, 0.08, 0.70), "pad", rotation=(-40, 0, 0))
s.box((0, 0.2, 0.2), (0.5, 0.9, 0.4))
for x in (-0.30, 0.30):
    s.rod((x, -0.35, 0.40), (x, -1.25, 1.30), 0.025)
sled = s.empty("sled")
s.moving.add(sled)
s.box((0, 0, 0), (0.62, 0.05, 0.50), "dark", rotation=(45, 0, 0), parent=sled)
for side, sign in (("L", 1), ("R", -1)):
    s.ik("leg", side, (sign * 0.5, -0.2, 1.6), parent=sled).location = (sign * 0.15, 0.05, -0.02)
    s.ik("arm", side, (sign * 0.5, 0.6, 0.3), pole_bone="chest").location = (sign * 0.27, 0.02, 0.46)
s.planted_feet()
reclined = ((0, 0.14, 0.58), (-42, 0, 0))
tilt = {"L": (-45, 0, 0), "R": (-45, 0, 0)}
s.pose(0, pelvis=reclined, bones={**s.grip(hand=(0, 90, 0)), "head": (22, 0, 0)}, objects={sled: (0, -0.66, 1.00)}, foot_tilt=tilt)
s.pose(1, objects={sled: (0, -0.38, 0.72)})
s.run()
