import importlib.util
import sys
from pathlib import Path
import plotly.io as pio
import json


# Define the path to the local py3dbp fork
module_path = Path("3D-bin-packing/py3dbp/__init__.py")

# Load the module
spec = importlib.util.spec_from_file_location("py3dbp", module_path)
py3dbp = importlib.util.module_from_spec(spec)
sys.modules["py3dbp"] = py3dbp
spec.loader.exec_module(py3dbp)

# Now you can use the forked version of py3dbp
from py3dbp import Packer, Bin, Item, Painter, PainterPlotly
import base64
from io import BytesIO

from decimal import Decimal

def to_float(value):
    """Helper function to convert Decimal to float."""
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, list):
        return list(to_float(v) for v in value)
    elif isinstance(value, tuple):
        return tuple(to_float(v) for v in value)
    return value

def Pack(cargos,containers):
    packer = Packer()
    for cargo in cargos:
        for i in range(cargo.quantity):
            item = Item(partno=cargo.name+str(i), name=str(cargo), typeof='cube', WHD=(cargo.length,cargo.height,cargo.width), weight=cargo.weight, loadbear=cargo.loadbearing, updown=cargo.rotate, level=1, color=cargo.color)
            packer.addItem(item)

    for container in containers:
        bin = Bin(partno=container.name, name=str(container), WHD=(container.length,container.height,container.width), max_weight=container.weight_capacity)
        packer.addBin(bin)

    packer.pack(
        fix_point=True,
        distribute_items=True,
        check_stable=True,
        support_surface_ratio=0.75,)
    
    
    # # Collect packing results
    # packed_data = []
    # plots = []
    # for b in packer.bins:
    #     container_data = {
    #         'container_id': b.partno,
    #         'name': b.name,
    #         'length': to_float(b.width),
    #         'height': to_float(b.height),
    #         'width': to_float(b.depth),
    #         'max_weight': to_float(b.max_weight),
    #         'items_': []
    #     }
    #     for item in b.items:
    #         item_data = {
    #             'id': item.partno,
    #             'name': item.name,
    #             'position': to_float(item.position),
    #             'dimensions': (to_float(item.width), to_float(item.height), to_float(item.depth)),
    #             'weight': to_float(item.weight),
    #             'color': item.color
    #         }
    #         container_data['items_'].append(item_data)
    #     packed_data.append(container_data)
 
    # for box in packer.bins:
    #     painter = Painter(box)
    #     fig,plots = painter.plotBoxAndItems(
    #         title=box.partno,
    #         alpha=0.2,
    #         write_num=True,
    #         fontsize=10
    #     )
    #     plots_list.append(plots)

    plots_list = []
    plots_3d = []
    gravity = []
    for box in packer.bins:
        gravity.append(box.gravity)
        painter = PainterPlotly(box)
        fig,plots = painter.plotBoxAndItems(
            title=box.partno,
            alpha=0.2,
            write_num=True,
            canvas_height = 700,
            canvas_width = 1200,
            showlegend = False
            #fontsize=10
        )
        plots_list.append(plots)
        fig_html = pio.to_html(fig, include_plotlyjs="cdn", full_html=False)
        plots_3d.append(str(fig_html))
        
    print("Done...")
    volume_usage = [[to_float(box.getVolume()) for box in packer.bins],[to_float(sum([item.getVolume() for item in box.items])) for box in packer.bins]]
    weight_usage = [[to_float(box.max_weight) for box in packer.bins], [to_float(box.getTotalWeight()) for box in packer.bins]]
    print(weight_usage)

    return [plots_list,plots_3d,gravity,volume_usage,weight_usage]
            
        