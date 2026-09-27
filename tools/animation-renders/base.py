import os
import sys

import bpy
import numpy as np
from mathutils import Vector

sys.path.insert(0, os.path.dirname(__file__))
from muscles import MUSCLES  # noqa: E402

WORK = os.environ["RENDER_WORK"]
BODY = "GEO-body_male_realistic"
EYES = (f"{BODY}.eye.L", f"{BODY}.eye.R")
BUNDLE_OFFSET_X = 2.2643022537231445

CENTER_BONES = {
    "pelvis": ((0, 0.0, 0.90), (0, 0.0, 1.02)),
    "spine": ((0, 0.0, 1.02), (0, 0.0, 1.20)),
    "chest": ((0, 0.0, 1.20), (0, 0.0, 1.42)),
    "neck": ((0, 0.0, 1.42), (0, -0.01, 1.52)),
    "head": ((0, -0.01, 1.52), (0, -0.01, 1.68)),
}
SIDE_BONES = {
    "clavicle": ((0.02, -0.02, 1.41), (0.17, 0.0, 1.40)),
    "upperarm": ((0.17, 0.0, 1.40), (0.285, 0.015, 1.10)),
    "forearm": ((0.285, 0.015, 1.10), (0.377, -0.07, 0.88)),
    "hand": ((0.377, -0.07, 0.88), (0.423, -0.122, 0.7923)),
    "forearm_twist": ((0.331, -0.0275, 0.99), (0.377, -0.07, 0.88)),
    "thigh": ((0.095, -0.01, 0.90), (0.135, -0.015, 0.49)),
    "shin": ((0.135, -0.015, 0.49), (0.165, 0.045, 0.085)),
    "foot": ((0.165, 0.045, 0.085), (0.19, -0.08, 0.025)),
    "toe": ((0.19, -0.08, 0.025), (0.20, -0.135, 0.02)),
}
FINGER_JOINTS = {
    "index": ((0.414, -0.1287, 0.7999), (0.4166, -0.1473, 0.7738), (0.4184, -0.1598, 0.7565), (0.4198, -0.1701, 0.742)),
    "middle": ((0.423, -0.122, 0.7923), (0.4276, -0.1323, 0.7587), (0.4307, -0.1392, 0.7363), (0.4333, -0.145, 0.7177)),
    "ring": ((0.4136, -0.1006, 0.8016), (0.4206, -0.1055, 0.7614), (0.4253, -0.1088, 0.7346), (0.4292, -0.1115, 0.7123)),
    "pinky": ((0.3983, -0.0665, 0.801), (0.4115, -0.0643, 0.7652), (0.4203, -0.0629, 0.7414), (0.4276, -0.0617, 0.7215)),
    "thumb": ((0.372, -0.1, 0.862), (0.3683, -0.1301, 0.8572), (0.3691, -0.1558, 0.8281), (0.3697, -0.1769, 0.8042)),
}
PALM_NORMAL_LEFT = Vector((-1, 0, 0))
for finger, joints in FINGER_JOINTS.items():
    for index in range(3):
        SIDE_BONES[f"{finger}{index + 1}"] = (joints[index], joints[index + 1])
PARENTS = {
    "spine": "pelvis", "chest": "spine", "neck": "chest", "head": "neck",
    "clavicle": "chest", "upperarm": "clavicle", "forearm": "upperarm", "hand": "forearm", "forearm_twist": "forearm",
    "thigh": "pelvis", "shin": "thigh", "foot": "shin", "toe": "foot",
    **{f"{finger}{index + 1}": ("hand" if index == 0 else f"{finger}{index}") for finger in FINGER_JOINTS for index in range(3)},
}
HAND_BONES = {"hand", *(f"{finger}{index + 1}" for finger in FINGER_JOINTS for index in range(3))}


def isolate_body(scene):
    keep = {BODY, *EYES}
    for obj in list(bpy.data.objects):
        if obj.name not in keep:
            bpy.data.objects.remove(obj, do_unlink=True)
    for obj in bpy.data.objects:
        if obj.name not in scene.collection.all_objects:
            scene.collection.objects.link(obj)
    body = bpy.data.objects[BODY]
    body.location = (0, 0, 0)
    body.animation_data_clear()
    for modifier in list(body.modifiers):
        if modifier.type != "MULTIRES":
            body.modifiers.remove(modifier)
    body.modifiers[0].levels = 1
    body.modifiers[0].render_levels = 3
    for name in EYES:
        eye = bpy.data.objects[name]
        world = eye.matrix_world.copy()
        eye.parent = None
        eye.matrix_world = world
        eye.location.x += BUNDLE_OFFSET_X
    return body


def build_rig(scene):
    rig = bpy.data.objects.new("rig", bpy.data.armatures.new("rig"))
    scene.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    bones = rig.data.edit_bones
    for name, (head, tail) in CENTER_BONES.items():
        bone = bones.new(name)
        bone.head, bone.tail = head, tail
    for name, (head, tail) in SIDE_BONES.items():
        for suffix, sign in (("L", 1), ("R", -1)):
            bone = bones.new(f"{name}.{suffix}")
            bone.head = (head[0] * sign, head[1], head[2])
            bone.tail = (tail[0] * sign, tail[1], tail[2])
    for name, parent in PARENTS.items():
        for bone_name in ([name] if name in CENTER_BONES else [f"{name}.L", f"{name}.R"]):
            parent_name = parent if parent in CENTER_BONES else f"{parent}.{bone_name[-1]}"
            bones[bone_name].parent = bones[parent_name]
    for bone in bones:
        base_name, _, side = bone.name.partition(".")
        if base_name in HAND_BONES:
            bone.align_roll(PALM_NORMAL_LEFT if side == "L" else -PALM_NORMAL_LEFT)
        else:
            bone.align_roll(Vector((0, -1, 0)) if abs(bone.vector.normalized().y) < 0.9 else Vector((0, 0, 1)))
    for suffix in ("L", "R"):
        upperarm = bones[f"upperarm.{suffix}"]
        helper = bones.new(f"shoulder.{suffix}")
        helper.head = upperarm.head
        helper.tail = upperarm.head + (upperarm.tail - upperarm.head).normalized() * 0.12
        helper.roll = upperarm.roll
        helper.parent = bones[f"clavicle.{suffix}"]
    bpy.ops.object.mode_set(mode="OBJECT")
    for side in ("L", "R"):
        track = rig.pose.bones[f"shoulder.{side}"].constraints.new("DAMPED_TRACK")
        track.target, track.subtarget, track.head_tail = rig, f"upperarm.{side}", 1.0
        track.influence = 0.5
        twist = rig.pose.bones[f"forearm_twist.{side}"].constraints.new("COPY_ROTATION")
        twist.target, twist.subtarget = rig, f"hand.{side}"
        twist.use_x = twist.use_z = False
        twist.target_space = twist.owner_space = "LOCAL"
        twist.influence = 0.5
    return rig


def bind(body, rig):
    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")
    armature = next(modifier for modifier in body.modifiers if modifier.type == "ARMATURE")
    armature.use_deform_preserve_volume = True
    refine_shoulder_weights(body, rig)
    smooth = body.modifiers.new("corrective", "CORRECTIVE_SMOOTH")
    smooth.rest_source = "ORCO"
    smooth.smooth_type = "LENGTH_WEIGHTED"
    smooth.iterations = 30
    smooth.factor = 0.5
    for name in EYES:
        eye = bpy.data.objects[name]
        world = eye.matrix_world.copy()
        eye.parent = rig
        eye.parent_type = "BONE"
        eye.parent_bone = "head"
        eye.matrix_world = world


def refine_shoulder_weights(body, rig):
    coords = np.array([vertex.co[:] for vertex in body.data.vertices])
    count = len(coords)
    groups = {group.name: group for group in body.vertex_groups}
    for side, sign in (("L", 1), ("R", -1)):
        groups.setdefault(f"shoulder.{side}", body.vertex_groups.new(name=f"shoulder.{side}"))
    groups = {group.name: group for group in body.vertex_groups}
    weights = {name: np.zeros(count) for name in groups}
    for vertex in body.data.vertices:
        for element in vertex.groups:
            weights[body.vertex_groups[element.group].name][vertex.index] = element.weight
    for side, sign in (("L", 1), ("R", -1)):
        x = coords[:, 0] * sign
        head = Vector(rig.data.bones[f"upperarm.{side}"].head_local)
        tail = Vector(rig.data.bones[f"upperarm.{side}"].tail_local)
        axis = np.array(tail - head)
        length = np.linalg.norm(axis)
        along = (coords - np.array(head)) @ (axis / length) / length
        arm = weights[f"upperarm.{side}"] + weights[f"forearm.{side}"] * 0
        torso_side = (x < 0.185) & (coords[:, 2] < 1.36) & (coords[:, 2] > 0.95)
        upper_chest = coords[:, 2] > 1.2
        moved = arm * torso_side
        weights[f"upperarm.{side}"] -= moved
        weights["chest"] += moved * upper_chest
        weights["spine"] += moved * ~upper_chest
        blend = np.clip((0.38 - along) / 0.33, 0, 1) * (x > 0.12) * (coords[:, 2] > 1.2)
        shared = weights[f"upperarm.{side}"] * blend * 0.6
        weights[f"upperarm.{side}"] -= shared
        weights[f"shoulder.{side}"] += shared
    total = sum(weights.values())
    total[total == 0] = 1
    for name, values in weights.items():
        values = values / total
        group = groups[name]
        group.remove(list(range(count)))
        nonzero = np.where(values > 1e-4)[0]
        for index in nonzero:
            group.add([int(index)], float(values[index]), "REPLACE")
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.mode_set(mode="WEIGHT_PAINT")
    for name in ("chest", "spine", "clavicle.L", "clavicle.R", "upperarm.L", "upperarm.R", "shoulder.L", "shoulder.R"):
        body.vertex_groups.active_index = groups[name].index
        bpy.ops.object.vertex_group_smooth(group_select_mode="ACTIVE", factor=0.5, repeat=4)
    bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    bpy.ops.object.mode_set(mode="OBJECT")


def ellipsoid_mask(coords, center, radii):
    distance = np.sqrt((((coords - np.array(center)) / np.array(radii)) ** 2).sum(1))
    return np.clip(2.4 - distance * 2.4, 0, 1) ** 0.6


def paint_masks(body):
    coords = np.array([vertex.co[:] for vertex in body.data.vertices])
    for muscle, spec in MUSCLES.items():
        mask = np.zeros(len(coords))
        for center, radii in spec["ellipsoids"]:
            for sign in (1, -1):
                mirrored = (center[0] * sign, center[1], center[2])
                mask = np.maximum(mask, ellipsoid_mask(coords, mirrored, radii))
        if "front_of" in spec:
            mask *= coords[:, 1] < spec["front_of"]
        if "behind" in spec:
            mask *= coords[:, 1] > spec["behind"]
        if "off_midline" in spec:
            mask *= np.abs(coords[:, 0]) > spec["off_midline"]
        body.data.attributes.new(f"m_{muscle}", "FLOAT", "POINT").data.foreach_set("value", mask.astype(np.float32))
    waist = np.clip((1.0 - coords[:, 2]) / 0.02, 0, 1)
    hem = np.clip((coords[:, 2] - 0.79) / 0.015, 0, 1)
    shorts = waist * hem * (np.abs(coords[:, 0]) < 0.24)
    body.data.attributes.new("shorts", "FLOAT", "POINT").data.foreach_set("value", shorts.astype(np.float32))


def studio(scene):
    look = bpy.data.objects.new("look", None)
    scene.collection.objects.link(look)
    camera = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(camera)
    track = camera.constraints.new("TRACK_TO")
    track.target, track.track_axis, track.up_axis = look, "TRACK_NEGATIVE_Z", "UP_Y"
    scene.camera = camera
    for name, energy, size, location in (("key", 420, 3, (2.2, -1.2, 3.2)), ("fill", 140, 4, (-2.5, 2.5, 2.5))):
        light = bpy.data.objects.new(name, bpy.data.lights.new(name, "AREA"))
        scene.collection.objects.link(light)
        light.data.energy, light.data.size, light.location = energy, size, location
        aim = light.constraints.new("TRACK_TO")
        aim.target, aim.track_axis, aim.up_axis = look, "TRACK_NEGATIVE_Z", "UP_Y"
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
    bpy.context.active_object.name = "floor"
    bpy.context.active_object.is_shadow_catcher = True
    scene.world = bpy.data.worlds.new("world")
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes["Background"]
    background.inputs[0].default_value = (1, 1, 1, 1)
    background.inputs[1].default_value = 0.22
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 48
    scene.cycles.use_denoising = True
    scene.render.use_persistent_data = True
    scene.render.film_transparent = True
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Base Contrast"
    scene.view_settings.exposure = -0.6
    scene.render.resolution_x, scene.render.resolution_y = 720, 540
    scene.render.fps = 15


def main():
    scene = bpy.context.scene
    body = isolate_body(scene)
    rig = build_rig(scene)
    bind(body, rig)
    paint_masks(body)
    studio(scene)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(WORK, os.environ.get("BASE_NAME", "base.blend")))
    print("BASE_SAVED", len(body.vertex_groups))


main()
