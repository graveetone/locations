import matplotlib.pyplot as plt
import streamlit as st
import pandas as pd

from utils.flows import compose_row
from utils.constants import (APP_ELAPSED_TIME_KEY, APPS_TITLES, IMAGE_PATH, SEED_PARAMS, REQUESTS_TITLES,
                             TABLE_HEADERS, APP_APDEX_KEY, APP_DB_SIZE_KEY,
                             APP_SUCCESS_KEY, TABLE_HEADERS_WITH_UNITS, APP_THROUGHTPUT_KEY)

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
    key="REQUESTS",
    default=REQUESTS_TITLES
)
show_table = st.sidebar.toggle("Відобразити таблицю")
show_interactive_plots = st.sidebar.toggle("Відобразити динамічні графіки", value=False)

if all((apps, seed_params, requests)):
    all_apps_data = pd.DataFrame(columns=TABLE_HEADERS)

    plot_data = {"Кількість точок": [param.locations_total for param in seed_params]}
    all_apps_data = {}   
    for app in apps:
        rows = [compose_row(app, param, requests=requests)
                for param in seed_params]
        current_app_data = pd.DataFrame(rows)
        all_apps_data[app] = current_app_data

        app_success_key = APP_SUCCESS_KEY.format(app=app)
        app_apdex_key = APP_APDEX_KEY.format(app=app)
        app_db_size_key = APP_DB_SIZE_KEY.format(app=app)
        app_elapsed_time_key = APP_ELAPSED_TIME_KEY.format(app=app)
        app_throughput_key = APP_THROUGHTPUT_KEY.format(app=app) 

        plot_data[app_success_key] = current_app_data["Кількість успішних запитів"]
        plot_data[app_apdex_key] = current_app_data["APDEX індекс"]
        plot_data[app_db_size_key] = current_app_data["Розмір бази"]
        plot_data[app_elapsed_time_key] = current_app_data["Середній час відповіді"]
        plot_data[app_throughput_key] = current_app_data["Пропускна здатність"]
         

    if show_table:
        for app in apps:
            st.subheader(app)
            all_apps_data[app].columns = TABLE_HEADERS_WITH_UNITS
            st.table(all_apps_data[app])
    
    if show_interactive_plots:
        apps_success = [APP_SUCCESS_KEY.format(app=app) for app in apps]
        apps_apdex = [APP_APDEX_KEY.format(app=app) for app in apps]
        apps_db_size = [APP_DB_SIZE_KEY.format(app=app) for app in apps]
        apps_elapsed_time = [APP_ELAPSED_TIME_KEY.format(app=app) for app in apps]
        apps_throughput = [APP_THROUGHTPUT_KEY.format(app=app) for app in apps]

        plots_mapping = {
            "Залежність кількості успішних запитів від кількості точок": apps_success,
            "Залежність значення індексу APDEX від кількості точок": apps_apdex,
            "Залежність розміру бази від кількості точок": apps_db_size,
            "Залежність середнього часу відповіді від кількості точок": apps_elapsed_time,
            "Залежність пропускної здатності від кількості точок": apps_throughput
        }

        for plot_title, ydata in plots_mapping.items():
            st.subheader(plot_title)
            st.line_chart(plot_data, x='Кількість точок', y=ydata)        
    else:
        plots_mapping = {
            "Залежність кількості успішних запитів від кількості точок": app_success_key,
            "Залежність значення індексу APDEX від кількості точок": app_apdex_key,
            "Залежність розміру бази від кількості точок": app_db_size_key,
            "Залежність середнього часу відповіді від кількості точок": app_elapsed_time_key,
            "Залежність пропускної здатності від кількості точок": app_throughput_key
        }


        for plot_title, ydata_key in plots_mapping.items():
            fig, ax = plt.subplots()
            st.subheader(plot_title)
            ax.plot(plot_data['Кількість точок'], plot_data[ydata_key], color='black')

            ax.scatter(plot_data['Кількість точок'], plot_data[ydata_key], marker='s', color='black')
            
            st.pyplot(fig)
else:
    st.header('Використовуйте параметри для відображення результатів')
    st.image(str(IMAGE_PATH), width=500)
