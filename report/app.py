import streamlit
from components.controls import build_controls, display_no_params_image
from components.plots import build_plots

controls = build_controls()

if all(([controls[control_name] for control_name in ["apps", "seed_params", "requests"]])):
    build_plots(**controls)
else:
    display_no_params_image()
