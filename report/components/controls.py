import streamlit as st
from utils.constants import (
    APPS_TITLES, SEED_PARAMS, REQUESTS_TITLES, IMAGE_PATH)


def build_controls():
    st.set_page_config(page_title='Locations App Report',
                       page_icon="📍",
                       layout="wide",
                       initial_sidebar_state="expanded"
                       )

    st.sidebar.header("Аналіз результатів")
    st.sidebar.subheader("Параметри")

    apps = st.sidebar.multiselect(
        label="Додатки",
        options=APPS_TITLES,
        key="APPS",
        default=APPS_TITLES
    )

    seed_params = st.sidebar.multiselect(
        label='Параметри сідування бази',
        options=SEED_PARAMS,
        key="SEED_PARAMS",
        default=SEED_PARAMS
    )

    requests = st.sidebar.multiselect(
        label='Вебсокетні запити',
        options=REQUESTS_TITLES,
        key="REQUESTS",
        default=REQUESTS_TITLES
    )

    show_approximation = st.sidebar.toggle(
        "Апроксимація", value=False)

    show_table = st.sidebar.toggle("Відобразити таблицю")

    return {
        "apps": apps,
        "seed_params": seed_params,
        "requests": requests,
        "show_approximation": show_approximation,
        "show_table": show_table
    }


def display_no_params_image():
    st.header('Використовуйте параметри для відображення результатів')
    st.image(str(IMAGE_PATH), width=500)
