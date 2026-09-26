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
    "hand": ((0.377, -0.07, 0.88), (0.41, -0.105, 0.80)),
    "fingers": ((0.41, -0.105, 0.80), (0.428, -0.11, 0.715)),
    "thumb": ((0.372, -0.10, 0.862), (0.39, -0.178, 0.815)),
    "thigh": ((0.095, -0.01, 0.90), (0.135, -0.015, 0.49)),
    "shin": ((0.135, -0.015, 0.49), (0.165, 0.045, 0.085)),
    "foot": ((0.165, 0.045, 0.085), (0.19, -0.08, 0.025)),
    "toe": ((0.19, -0.08, 0.025), (0.20, -0.135, 0.02)),
}
PARENTS = {
    "spine": "pelvis", "chest": "spine", "neck": "chest", "head": "neck",
    "clavicle": "chest", "upperarm": "clavicle", "forearm": "upperarm", "hand": "forearm",
    "fingers": "hand", "thumb": "hand", "thigh": "pelvis", "shin": "thigh", "foot": "shin", "toe": "foot",
}


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
        bone.align_roll(Vector((0, -1, 0)) if abs(bone.vector.normalized().y) < 0.9 else Vector((0, 0, 1)))
    bpy.ops.object.mode_set(mode="OBJECT")
    return rig


def bind(body, rig):
    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")
    for name in EYES:
        eye = bpy.data.objects[name]
        world = eye.matrix_world.copy()
        eye.parent = rig
        eye.parent_type = "BONE"
        eye.parent_bone = "head"
        eye.matrix_world = world


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
    scene.cycles.samples = 32
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
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(WORK, "base.blend"))
    print("BASE_SAVED", len(body.vertex_groups))


main()
