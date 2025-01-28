import importlib.util
import sys
from pathlib import Path
import plotly.io as pio


# Define the path to the local py3dbp fork
module_path = Path("3D-bin-packing/py3dbp/__init__.py")

# Load the module
spec = importlib.util.spec_from_file_location("py3dbp", module_path)
py3dbp = importlib.util.module_from_spec(spec)
sys.modules["py3dbp"] = py3dbp
spec.loader.exec_module(py3dbp)

# Create mock classes to simulate cargo and container data structure
class Cargo:
    def __init__(self, name, length, height, width, weight, loadbearing, rotate, color):
        self.name = name
        self.length = length
        self.height = height
        self.width = width
        self.weight = weight
        self.loadbearing = loadbearing
        self.rotate = rotate
        self.color = color

class Container:
    def __init__(self,name, length, height, width, weight_capacity):
        self.name = name
        self.length = length
        self.height = height
        self.width = width
        self.weight_capacity = weight_capacity

# Example cargos and containers
cargos = [
    Cargo("Cargo1", 3, 2, 1, 10, 20, True, "red"),
    Cargo("Cargo2", 5, 6, 3, 5, 10, True, "blue"),
]

containers = [
    Container("Container1", 10, 3, 5, 50),
]

# Now you can use the forked version of py3dbp
from py3dbp import Packer, Bin, Item, Painter, PainterPlotly

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
        item = Item(partno=cargo.name, name=str(cargo), typeof='cube', WHD=(cargo.length,cargo.height,cargo.width), weight=cargo.weight, loadbear=cargo.loadbearing, updown=cargo.rotate, level=1, color=cargo.color)
        packer.addItem(item)

    for container in containers:
        bin = Bin(partno=container.name,name=str(container), WHD=(container.length,container.height,container.width), max_weight=container.weight_capacity)
        packer.addBin(bin)

    packer.pack(
        fix_point=True,
        distribute_items=True,
        check_stable=True,
        support_surface_ratio=0.75,
        )
    
    for box in packer.bins:
        for item in box.items:
            print(vars(item))
    
    # # Collect packing results
    # for box in packer.bins:
    #     painter = Painter(box)
    #     fig = painter.plotBoxAndItems(
    #         title=box.partno,
    #         alpha=0.2,
    #         write_num=True,
    #         fontsize=10
    #     )
    # fig.show()

    plots_list = []
    for box in packer.bins:
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
    # fig.write_html("test.html")
    # fig.show()
    # import time
    # time.sleep(60)
    # plotly_fig = tls.mpl_to_plotly(fig)
    # # Render Plotly figure
    # plotly_fig.show()   

# pio.renderers.default = "browser"
# Call the Pack function with sample data
Pack(cargos, containers)