import streamlit as st
import pandas as pd

from utils.flows import compose_row
from utils.constants import (APPS_TITLES, SEED_PARAMS, REQUESTS_TITLES,
                             TABLE_HEADERS, APP_APDEX_KEY, APP_DB_SIZE_KEY,
                             APP_SUCCESS_KEY)

st.set_page_config(page_title='Locations App Report',
                   page_icon="📍",
                   layout="wide",
                   initial_sidebar_state="expanded"
                   )

#  side_bar_with_controls

st.sidebar.header("Аналіз результатів")
st.sidebar.subheader("Параметри")

apps = st.sidebar.multiselect(
    label="Додатки",
    options=APPS_TITLES,
    key="APPS"
)

seed_params = st.sidebar.multiselect(
    label='Параметри сідування бази',
    options=SEED_PARAMS,
    key="SEED_PARAMS"
)

requests = st.sidebar.multiselect(
    label='Вебсокетні запити',
    options=REQUESTS_TITLES,
    key="REQUESTS"
)
show_table = st.sidebar.checkbox("Відобразити таблицю")

if apps and seed_params:
    all_apps_data = pd.DataFrame(columns=TABLE_HEADERS)

    plot_data = {"Кількість точок": [param.locations_total for param in seed_params]}

    for app in apps:
        rows = [compose_row(app, param, requests=requests)
                for param in seed_params]
        current_app_data = pd.DataFrame(rows)
        all_apps_data = pd.concat(
            [all_apps_data, current_app_data], ignore_index=True)


        app_success_key = APP_SUCCESS_KEY.format(app=app)
        app_apdex_key = APP_APDEX_KEY.format(app=app)
        app_db_size_key = APP_DB_SIZE_KEY.format(app=app)

        plot_data[app_success_key] = current_app_data["Кількість успішних запитів"]
        plot_data[app_apdex_key] = current_app_data["APDEX індекс"]
        plot_data[app_db_size_key] = current_app_data["Розмір бази"]

    if show_table:
        st.table(all_apps_data)

    apps_success = [APP_SUCCESS_KEY.format(app=app) for app in apps]
    apps_apdex = [APP_APDEX_KEY.format(app=app) for app in apps]
    apps_db_size = [APP_DB_SIZE_KEY.format(app=app) for app in apps]

    plots_mapping = {
        "Залежність кількості успішних запитів від кількості точок": apps_success,
        "Залежність значення індексу APDEX від кількості точок": apps_apdex,
        "Залежність розміру бази від кількості точок": apps_db_size
    }

    for plot_title, ydata in plots_mapping.items():
        st.subheader(plot_title)
        st.line_chart(plot_data, x='Кількість точок', y=ydata)
else:
    st.image("image.png", width=600)
