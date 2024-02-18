import altair
import streamlit as st
import pandas as pd

from utils.flows import compose_row
from utils.constants import (
    APPS_TITLES, IMAGE_PATH, SEED_PARAMS, REQUESTS_TITLES, TABLE_HEADERS)

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

admin_panel = st.sidebar.toggle("Адмін панель")
method = 'log'
degree = 0

show_approximation = st.sidebar.toggle(
    "Апроксимація", value=False)


method = st.sidebar.selectbox('Метод апроксимації', options=[
                                  'linear', 'log', 'exp', 'pow', 'quad', 'poly'])
show_table = st.sidebar.toggle("Відобразити таблицю")

if all((apps, seed_params, requests)):
    all_apps_data_df = pd.DataFrame(columns=TABLE_HEADERS)

    plots = [
        "Кількість успішних запитів",
        "APDEX індекс",
        "Розмір бази",
        "Середній час відповіді",
        "Пропускна здатність"
    ]

    for app in apps:
        rows = [compose_row(app, param, requests=requests)
                for param in seed_params]
        app_df = pd.DataFrame(rows, columns=TABLE_HEADERS)
        all_apps_data_df = pd.concat([all_apps_data_df, app_df])

    for plot in plots:
        st.subheader(plot)
        if show_approximation:
            scatter = altair.Chart(all_apps_data_df).mark_point(size=60).encode(
                x='Кількість точок', y=plot, color='Додаток', tooltip=TABLE_HEADERS).interactive()

            approximation = scatter.transform_regression('Кількість точок', plot, groupby=[
                                                         'Додаток'], method=method, order=degree).mark_line()
            figure = scatter + approximation
        else:
            lines = altair.Chart(all_apps_data_df).mark_line().encode(
                x='Кількість точок', y=plot, color='Додаток', tooltip=TABLE_HEADERS).interactive()
            figure = lines

        st.altair_chart(figure, use_container_width=True)
    if show_table:
        st.table(all_apps_data_df)
else:
    st.header('Використовуйте параметри для відображення результатів')
    st.image(str(IMAGE_PATH), width=500)
