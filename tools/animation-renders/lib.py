import json
import math
import os
import subprocess
import sys

import bpy
from mathutils import Euler, Matrix, Quaternion, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.environ["RENDER_WORK"]
PUBLIC = os.path.join(HERE, "..", "..", "public", "animations")
FPS = 15
LEVELS = {"concentric": 1.0, "eccentric": 0.62, "isometric": 0.85}
SKIN = (0.6, 0.58, 0.56, 1)
PRIMARY_RED = (0.86, 0.1, 0.06, 1)
SECONDARY_RED = (0.85, 0.35, 0.28, 1)
SHORTS = (0.035, 0.037, 0.04, 1)


def mirror(rotation):
    x, y, z = rotation
    return (x, -y, -z)


def material(name, color, roughness=0.5, metallic=0.0):
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    shader = result.node_tree.nodes["Principled BSDF"]
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metallic
    return result


class Scene:
    def __init__(self, exercise_id):
        bpy.ops.wm.open_mainfile(filepath=os.path.join(WORK, "base.blend"))
        self.id = exercise_id
        self.scene = bpy.context.scene
        self.rig = bpy.data.objects["rig"]
        self.body = bpy.data.objects["GEO-body_male_realistic"]
        with open(os.path.join(HERE, "timelines.json")) as handle:
            self.timeline = json.load(handle)[exercise_id]
        self.mats = {
            "pad": material("pad", (0.05, 0.06, 0.06, 1), 0.45),
            "steel": material("steel", (0.75, 0.75, 0.75, 1), 0.25, 1.0),
            "iron": material("iron", (0.03, 0.03, 0.03, 1), 0.35, 0.6),
            "frame": material("frame", (0.85, 0.85, 0.85, 1), 0.3),
            "dark": material("dark", (0.12, 0.13, 0.13, 1), 0.4, 0.3),
            "cable": material("cable", (0.08, 0.08, 0.08, 1), 0.4),
        }
        self.poses = []
        self.foot_rest = {}
        self.targets = {}
        self.fk_bones = set()
        self.moving = set()
        self.intensity = {}
        self.secondary_value = None
        self._skin()

    def _skin(self):
        skin = bpy.data.materials.new("skin")
        skin.use_nodes = True
        tree = skin.node_tree
        nodes, links = tree.nodes, tree.links
        shader = nodes["Principled BSDF"]
        shader.inputs["Roughness"].default_value = 0.55
        shader.inputs["Subsurface Weight"].default_value = 0.08
        shader.inputs["Subsurface Radius"].default_value = (0.3, 0.15, 0.1)

        def attribute(name):
            node = nodes.new("ShaderNodeAttribute")
            node.attribute_name = name
            return node.outputs["Fac"]

        def combine(sockets):
            result = sockets[0]
            for socket in sockets[1:]:
                maximum = nodes.new("ShaderNodeMath")
                maximum.operation = "MAXIMUM"
                links.new(result, maximum.inputs[0])
                links.new(socket, maximum.inputs[1])
                result = maximum.outputs[0]
            return result

        def scaled(socket, value_node):
            multiply = nodes.new("ShaderNodeMath")
            multiply.operation = "MULTIPLY"
            links.new(socket, multiply.inputs[0])
            links.new(value_node.outputs[0], multiply.inputs[1])
            return multiply.outputs[0]

        primary = []
        for muscle in self.timeline["primary"]:
            value = nodes.new("ShaderNodeValue")
            value.outputs[0].default_value = 1.0
            self.intensity[muscle] = value
            primary.append(scaled(attribute(f"m_{muscle}"), value))
        self.secondary_value = nodes.new("ShaderNodeValue")
        self.secondary_value.outputs[0].default_value = 0.55
        secondary = self.timeline["secondary"]
        secondary_socket = scaled(combine([attribute(f"m_{m}") for m in secondary]), self.secondary_value) if secondary else None

        clothed = nodes.new("ShaderNodeMix")
        clothed.data_type = "RGBA"
        clothed.inputs["A"].default_value = SKIN
        clothed.inputs["B"].default_value = SHORTS
        links.new(attribute("shorts"), clothed.inputs["Factor"])
        base = nodes.new("ShaderNodeMix")
        base.data_type = "RGBA"
        links.new(clothed.outputs["Result"], base.inputs["A"])
        base.inputs["B"].default_value = SECONDARY_RED
        if secondary_socket:
            links.new(secondary_socket, base.inputs["Factor"])
        else:
            base.inputs["Factor"].default_value = 0
        red = nodes.new("ShaderNodeMix")
        red.data_type = "RGBA"
        red.inputs["B"].default_value = PRIMARY_RED
        links.new(base.outputs["Result"], red.inputs["A"])
        links.new(combine(primary), red.inputs["Factor"])
        links.new(red.outputs["Result"], shader.inputs["Base Color"])
        self.body.data.materials.clear()
        self.body.data.materials.append(skin)

    def camera(self, location, look, lens=45):
        bpy.data.objects["cam"].location = location
        bpy.data.objects["cam"].data.lens = lens
        bpy.data.objects["look"].location = look

    def lights(self, key=None, fill=None):
        if key:
            bpy.data.objects["key"].location = key
        if fill:
            bpy.data.objects["fill"].location = fill

    def box(self, location, size, mat="frame", rotation=(0, 0, 0), bevel=0.25, parent=None):
        bpy.ops.mesh.primitive_cube_add(location=location, rotation=[math.radians(a) for a in rotation])
        obj = bpy.context.active_object
        obj.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
        bpy.ops.object.transform_apply(scale=True)
        if bevel:
            modifier = obj.modifiers.new("bevel", "BEVEL")
            modifier.width = min(size) * bevel
            modifier.segments = 3
        obj.data.materials.append(self.mats[mat])
        if parent:
            obj.parent = parent
        return obj

    def cylinder(self, location, radius, depth, rotation=(0, 0, 0), mat="steel", parent=None, vertices=48):
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=vertices, radius=radius, depth=depth, location=location, rotation=[math.radians(a) for a in rotation]
        )
        obj = bpy.context.active_object
        obj.data.materials.append(self.mats[mat])
        bpy.ops.object.shade_smooth()
        if parent:
            obj.parent = parent
        return obj

    def rod(self, start, end, radius, mat="frame"):
        start, end = Vector(start), Vector(end)
        axis = end - start
        obj = self.cylinder(tuple((start + end) / 2), radius, axis.length, mat=mat)
        obj.rotation_mode = "QUATERNION"
        obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(axis.normalized())
        return obj

    def empty(self, name, location=(0, 0, 0), parent=None):
        obj = bpy.data.objects.new(name, None)
        self.scene.collection.objects.link(obj)
        obj.location = location
        if parent:
            obj.parent = parent
        return obj

    def bench(self, center, length, top=0.45, width=0.30):
        x, y = center
        self.box((x, y, top - 0.035), (width, length, 0.07), "pad")
        for offset in (-length / 2 + 0.12, length / 2 - 0.12):
            self.box((x, y + offset, (top - 0.07) / 2), (width - 0.04, 0.05, top - 0.07))

    def barbell(self, name="bar", plates=True, length=2.1):
        bar = self.empty(name)
        self.cylinder((0, 0, 0), 0.014, length, (0, 90, 0), parent=bar)
        if plates:
            for sign in (-1, 1):
                self.cylinder((sign * 0.78, 0, 0), 0.225, 0.05, (0, 90, 0), "iron", bar, 64)
                self.cylinder((sign * 0.84, 0, 0), 0.19, 0.04, (0, 90, 0), "iron", bar, 64)
                self.cylinder((sign * 0.70, 0, 0), 0.03, 0.06, (0, 90, 0), parent=bar)
        self.moving.add(bar)
        return bar

    def dumbbell(self, name, axis="x"):
        rotation = {"x": (0, 90, 0), "y": (90, 0, 0), "z": (0, 0, 0)}[axis]
        holder = self.empty(name)
        offset = Vector({"x": (1, 0, 0), "y": (0, 1, 0), "z": (0, 0, 1)}[axis])
        self.cylinder((0, 0, 0), 0.016, 0.16, rotation, parent=holder)
        for sign in (-1, 1):
            self.cylinder(tuple(offset * 0.11 * sign), 0.055, 0.06, rotation, "iron", holder, 32)
        self.moving.add(holder)
        return holder

    def cable(self, start, end_object, radius=0.005):
        curve = bpy.data.curves.new(f"cable_{end_object.name}", "CURVE")
        curve.dimensions = "3D"
        curve.bevel_depth = radius
        spline = curve.splines.new("POLY")
        spline.points.add(1)
        spline.points[0].co = (*start, 1)
        spline.points[1].co = (*end_object.matrix_world.translation, 1)
        obj = bpy.data.objects.new(curve.name, curve)
        self.scene.collection.objects.link(obj)
        obj.data.materials.append(self.mats["cable"])
        anchor = self.empty(f"{curve.name}_anchor", start)
        bpy.context.view_layer.update()
        for index, target in ((0, anchor), (1, end_object)):
            hook = obj.modifiers.new(f"hook{index}", "HOOK")
            hook.object = target
            hook.vertex_indices_set([index])
            hook.matrix_inverse = target.matrix_world.inverted()
        return obj

    def attach(self, obj, bone, location=None):
        bpy.context.view_layer.update()
        world = obj.matrix_world.copy()
        if location is not None:
            world = Matrix.Translation(location) @ world.to_3x3().to_4x4()
        obj.parent = self.rig
        obj.parent_type = "BONE"
        obj.parent_bone = bone
        bpy.context.view_layer.update()
        obj.matrix_world = world
        return obj

    def ik(self, limb, side, pole, parent=None, pole_angle=None, pole_bone=None):
        bone = {"arm": "forearm", "leg": "shin"}[limb]
        effector = {"arm": "hand", "leg": "foot"}[limb]
        pole_angle = {"arm": -90, "leg": 90}[limb] if pole_angle is None else pole_angle
        target = self.empty(f"t_{effector}.{side}", parent=parent)
        pole_empty = self.empty(f"p_{effector}.{side}", pole)
        if pole_bone:
            self.attach(pole_empty, pole_bone)
        constraint = self.rig.pose.bones[f"{bone}.{side}"].constraints.new("IK")
        constraint.target, constraint.pole_target = target, pole_empty
        constraint.chain_count, constraint.pole_angle = 2, math.radians(pole_angle)
        self.targets[f"{effector}.{side}"] = target
        self.targets[f"pole_{effector}.{side}"] = pole_empty
        return target

    def planted_feet(self, sides=("L", "R")):
        for side in sides:
            bone = self.rig.pose.bones[f"foot.{side}"]
            holder = self.empty(f"r_foot.{side}")
            holder.matrix_world = self.rig.matrix_world @ bone.bone.matrix_local
            holder.rotation_mode = "QUATERNION"
            self.foot_rest[side] = holder.rotation_quaternion.copy()
            copy = bone.constraints.new("COPY_ROTATION")
            copy.target = holder
            self.targets[f"footrot.{side}"] = holder

    def hand_dumbbells(self, twist_axis="y"):
        bells = {}
        for side, sign in (("L", 1), ("R", -1)):
            bell = self.dumbbell(f"db.{side}", axis=twist_axis)
            bell.location = (sign * 0.388, -0.094, 0.832)
            self.attach(bell, f"hand.{side}")
            bells[side] = bell
        return bells

    def standing_legs(self, width=0.165, pole_y=-1.2):
        for side, sign in (("L", 1), ("R", -1)):
            self.ik("leg", side, (sign * (width + 0.05), pole_y, 0.55)).location = (sign * width, 0.045, 0.085)
        self.planted_feet()

    def seat(self, top=0.46, depth=0.40, y=0.0, back=None):
        self.box((0, y, top - 0.04), (0.42, depth, 0.08), "pad")
        self.box((0, y, (top - 0.08) / 2), (0.08, 0.08, top - 0.08))
        self.box((0, y, 0.02), (0.5, 0.5, 0.04))
        if back is not None:
            height, tilt = back
            self.box((0, y + depth / 2 + 0.04, top + height / 2), (0.42, 0.08, height), "pad", rotation=(-tilt, 0, 0))

    def seated_legs(self, feet_y=-0.48, width=0.17):
        for side, sign in (("L", 1), ("R", -1)):
            self.ik("leg", side, (sign * (width + 0.05), -1.4, 0.7)).location = (sign * width, feet_y, 0.085)
        self.planted_feet()

    def lever(self, start, end_object, radius=0.018):
        cable = self.cable(start, end_object, radius)
        cable.data.materials[0] = self.mats["frame"]
        return cable

    def both(self, name, rotation):
        return {f"{name}.L": rotation, f"{name}.R": mirror(rotation)}

    def grip(self, hand=(0, 90, 0), fingers=(100, 0, 0), thumb=(-60, 0, 0), sides=("L", "R")):
        return {f"{name}.{side}": (rotation if side == "L" else mirror(rotation))
                for side in sides for name, rotation in (("hand", hand), ("fingers", fingers), ("thumb", thumb))}

    def pose(self, index, pelvis=None, bones=None, targets=None, objects=None, foot_tilt=None):
        previous = self.poses[index - 1] if index > 0 else {"pelvis": None, "bones": {}, "targets": {}, "objects": {}, "foot_tilt": {}}
        state = {
            "pelvis": pelvis or previous["pelvis"],
            "bones": {**previous["bones"], **(bones or {})},
            "targets": {**previous["targets"], **(targets or {})},
            "objects": {**previous["objects"], **(objects or {})},
            "foot_tilt": {**previous["foot_tilt"], **(foot_tilt or {})},
        }
        self.poses.append(state)

    def _apply(self, state, frame):
        location, rotation = state["pelvis"]
        pelvis = self.rig.pose.bones["pelvis"]
        pelvis.rotation_mode = "QUATERNION"
        rest = pelvis.bone.matrix_local
        head = rest.to_translation()
        world = Matrix.Translation(location) @ Euler([math.radians(a) for a in rotation]).to_matrix().to_4x4() @ Matrix.Translation(-head) @ rest
        pelvis.matrix = world
        bpy.context.view_layer.update()
        pelvis.keyframe_insert("location", frame=frame)
        pelvis.keyframe_insert("rotation_quaternion", frame=frame)
        for name, rotation in state["bones"].items():
            bone = self.rig.pose.bones[name]
            bone.rotation_mode = "XYZ"
            bone.rotation_euler = [math.radians(a) for a in rotation]
            bone.keyframe_insert("rotation_euler", frame=frame)
        for name, location in state["targets"].items():
            self.targets[name].location = location
            self.targets[name].keyframe_insert("location", frame=frame)
        for obj, location in state["objects"].items():
            obj.location = location
            obj.keyframe_insert("location", frame=frame)
        for side, tilt in state["foot_tilt"].items():
            holder = self.targets[f"footrot.{side}"]
            holder.rotation_quaternion = Euler([math.radians(a) for a in tilt]).to_quaternion() @ self.foot_rest[side]
            holder.keyframe_insert("rotation_quaternion", frame=frame)

    def _key_levels(self, frame, level, active):
        for muscle, node in self.intensity.items():
            value = level if active is None or muscle in active else 0.2
            node.outputs[0].default_value = value
            node.outputs[0].keyframe_insert("default_value", frame=frame)
        self.secondary_value.outputs[0].default_value = 0.35 + 0.3 * level
        self.secondary_value.outputs[0].keyframe_insert("default_value", frame=frame)

    def animate(self):
        keyframes = self.timeline["keyframes"]
        assert len(self.poses) == len(keyframes), f"{self.id}: {len(self.poses)} poses for {len(keyframes)} keyframes"
        time = 0.0
        linear_frames = []
        for index, keyframe in enumerate(keyframes):
            previous = keyframes[index - 1]
            start = time * FPS
            self._apply(self.poses[index], start)
            held = 1.0 if previous["effort"] == "concentric" else LEVELS[keyframe["effort"]]
            self._key_levels(start, held, keyframe["active"])
            if keyframe["hold"]:
                self._apply(self.poses[index], (time + keyframe["hold"]) * FPS)
                self._key_levels((time + keyframe["hold"]) * FPS, held, keyframe["active"])
            move_start = (time + keyframe["hold"]) * FPS
            self._key_levels(move_start + keyframe["duration"] * FPS / 3, LEVELS[keyframe["effort"]], keyframe["active"])
            if keyframe["ease"] == "linear":
                linear_frames.append(move_start)
            time += keyframe["hold"] + keyframe["duration"]
        self._apply(self.poses[0], time * FPS)
        self._key_levels(time * FPS, 1.0 if keyframes[-1]["effort"] == "concentric" else LEVELS[keyframes[0]["effort"]], keyframes[0]["active"])
        for datablock in [self.rig, *self.targets.values(), *self.moving]:
            if not datablock.animation_data or not datablock.animation_data.action:
                continue
            for curve in datablock.animation_data.action.fcurves:
                for point in curve.keyframe_points:
                    point.interpolation = "LINEAR" if any(abs(point.co.x - f) < 0.01 for f in linear_frames) else "BEZIER"
                    point.handle_left_type = point.handle_right_type = "AUTO_CLAMPED"
        self.frames = round(time * FPS)
        self.scene.frame_start, self.scene.frame_end = 0, self.frames - 1

    def run(self):
        self.animate()
        mode = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "preview"
        folder = os.path.join(WORK, self.id)
        os.makedirs(folder, exist_ok=True)
        if mode == "preview":
            frames = [int(f) for f in sys.argv[sys.argv.index("--") + 2].split(",")] if len(sys.argv) > sys.argv.index("--") + 2 else None
            if os.environ.get("RENDER_CAM"):
                location, look, lens = os.environ["RENDER_CAM"].split(";")
                self.camera(tuple(map(float, location.split(","))), tuple(map(float, look.split(","))), float(lens))
            self.scene.cycles.samples = 8
            self.scene.render.resolution_percentage = 50
            self.body.modifiers[0].render_levels = 2
            for stale in os.listdir(folder):
                if stale.startswith("preview_"):
                    os.remove(os.path.join(folder, stale))
            starts, time = [], 0.0
            for keyframe in self.timeline["keyframes"]:
                starts.append(round((time + keyframe["hold"]) * FPS))
                time += keyframe["hold"] + keyframe["duration"]
            for frame in frames or starts:
                self.scene.frame_set(frame)
                self.scene.render.filepath = os.path.join(folder, f"preview_{frame:04d}.png")
                bpy.ops.render.render(write_still=True)
            print("PREVIEW_DONE", self.frames, "frames")
            return
        self.scene.render.filepath = os.path.join(folder, "f_####")
        for stale in os.listdir(folder):
            if stale.startswith("f_"):
                os.remove(os.path.join(folder, stale))
        bpy.ops.render.render(animation=True)
        os.makedirs(PUBLIC, exist_ok=True)
        width, height = self.scene.render.resolution_x, self.scene.render.resolution_y
        overlay = [
            "-f", "lavfi", "-i", f"color=white:s={width}x{height}:r={FPS}",
            "-framerate", str(FPS), "-start_number", "0", "-i", os.path.join(folder, "f_%04d.png"),
            "-filter_complex", "[0][1]overlay=shortest=1,format=yuv420p",
        ]
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *overlay, "-c:v", "libx264", "-crf", "24", "-preset", "slow",
                        "-movflags", "+faststart", os.path.join(PUBLIC, f"{self.id}.mp4")], check=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"color=white:s={width}x{height}",
                        "-i", os.path.join(folder, "f_0000.png"), "-filter_complex", "[0][1]overlay", "-frames:v", "1",
                        "-q:v", "4", os.path.join(PUBLIC, f"{self.id}.jpg")], check=True)
        print("RENDER_DONE", self.frames, "frames")
