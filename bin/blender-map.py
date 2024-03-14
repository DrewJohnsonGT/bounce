import bpy
import bmesh
import json  # Import the json module

width = 540
height = 960

def draw_base():
    vertices = [(0, 0, 0), (width, 0, 0), (width, height, 0), (0, height, 0)]

    # Define the faces of the rectangle
    faces = [(0, 1, 2, 3)]  # A face made of all four vertices

    # Create new mesh
    mesh = bpy.data.meshes.new(name="Rectangle")

    # Create a new object with the mesh
    obj = bpy.data.objects.new("Rectangle", mesh)

    # Make the object the active object and select it
    scene = bpy.context.scene
    scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    # Fill mesh with verts, edges, faces
    mesh.from_pydata(vertices, [], faces)

    # Update the mesh with new data
    mesh.update()

# draw_base()

def export_connected_vertices(context):
    # Ensure the context object is a mesh
    if context.object.type != 'MESH':
        print("Active object is not a mesh.")
        return

    # Switch to object mode to update the selection
    bpy.ops.object.mode_set(mode='OBJECT')

    # Get the active object and its mesh data
    obj = context.object
    mesh = obj.data

    # Create a BMesh to work with
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(mesh)
    
    # Ensure we're working with an updated view of the mesh
    bm.verts.ensure_lookup_table()
    bm.edges.ensure_lookup_table()

    # List to store the ordered vertices
    ordered_vertices = []

    # Find a starting vertex (any selected vertex will do)
    for v in bm.verts:
        if v.select:
            start_v = v
            break
    else:
        print("No selected vertices found.")
        return

    # Use a set to keep track of visited vertices to avoid infinite loops
    visited = set()

    # Starting with the first selected vertex, follow connected edges
    current_v = start_v
    while True:
        visited.add(current_v.index)
        ordered_vertices.append({"x": round(current_v.co.x), "y": round(current_v.co.y)})
        
        # Find a connected vertex that hasn't been visited
        for edge in current_v.link_edges:
            other_v = edge.other_vert(current_v)
            if other_v.index not in visited and other_v.select:
                current_v = other_v
                break
        else:
            # No unvisited, selected connected vertices left
            break

    # Print or save the ordered vertices' coordinates
    print(ordered_vertices)

    # Example of saving to a file (modify path as needed)
    file_path = bpy.path.abspath('/Users/drew/Desktop/vertices.json')
    with open(file_path, 'w') as f:
        json.dump(ordered_vertices, f, indent=4)

    print(f"Connected vertices' x/y values exported to: {file_path}")

# Ensure we are in edit mode and an object is selected
if bpy.context.object and bpy.context.object.mode == 'EDIT':
    export_connected_vertices(bpy.context)
else:
    print("No mesh object in edit mode selected.")
