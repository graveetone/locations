import streamlit as st
import altair
import pandas as pd
import numpy as np
from scipy.optimize import curve_fit

from utils.constants import (
    APPS_TITLES, SEED_PARAMS, REQUESTS_TITLES, IMAGE_PATH, TABLE_HEADERS)
from utils.flows import compose_row


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


if all((apps, seed_params, requests)):
    all_apps_data_df = pd.DataFrame(columns=TABLE_HEADERS)

    plots = [
        {
            "field": "Кількість успішних запитів",
            "title": 'Залежність кількості успішних запитів від кількості точок',
            "approximation": "y = a log^2 x + b log x + c"
        },
        {
            "field": "Розмір бази",
            "title": 'Залежність розміру бази від кількості точок',
            "approximation": "y = ax + b"
        },
        {
            "field": "Середній час відповіді",
            "title": 'Залежність середнього часу відповіді від кількості точок',
            "approximation": "y = ax^b + c"
        },
        {
            "field": "Пропускна здатність",
            "title": 'Залежність пропускної здатності від кількості точок',
            "approximation": "y = a log^2 x + b log x + c"
        }
    ]

    for app in apps:
        rows = [compose_row(app, param, requests=requests)
                for param in seed_params]
        app_df = pd.DataFrame(rows, columns=TABLE_HEADERS)
        all_apps_data_df = pd.concat([all_apps_data_df, app_df])

    for plot in plots:
        st.subheader(plot['title'])
        if show_approximation:
            app_to_approximate = st.selectbox(
                label="Додаток", options=apps, key=f"app {plot['field']}")
            app_df = all_apps_data_df[all_apps_data_df["Додаток"]
                                      == app_to_approximate]

            scatter = altair.Chart(app_df).mark_point(size=60).encode(
                x='Кількість точок', y=plot['field'], color='Додаток', tooltip=TABLE_HEADERS).interactive()

            figure = scatter

            FUNCTIONS = {
                "y = ax + b": lambda x, a, b, c: a * np.array(x) + b,
                "y = a log^2 x + b log x + c": lambda x, a, b, c: a * np.log(x)**2 + b * np.log(x) + c,
                "y = ax^b + c": lambda x, a, b, c: a * np.power(x, b) + c,
                "y = ax^2 + bx + c": lambda x, a, b, c: a*(np.array(x)**2) + b*np.array(x) + c
            }

            func = st.selectbox(label='Функція для апроксимації',
                                key=f"func for {plot['field']}",
                                options=list(FUNCTIONS.keys()),
                                index=list(FUNCTIONS.keys()).index(plot['approximation']))  # plot['approximation']['method']
            if func:
                func = FUNCTIONS.get(func)
                x, y = list(app_df["Кількість точок"]), list(
                    app_df[plot['field']])

                popt, pcov = curve_fit(func, x, y)
                a, b, c = tuple(popt)

                residuals = y - func(x, a, b, c)
                tss = np.sum((y - np.mean(y))**2)
                rss = np.sum(residuals**2)
                r_squared = 1 - (rss / tss)

                st.subheader(f"R-squared: {r_squared}")

                regression_df = pd.DataFrame(columns=['x', 'y'])

                regression_df['x'] = np.linspace(min(x), max(x), 100)
                regression_df['y'] = func(regression_df['x'], *popt)
                lines = altair.Chart(regression_df).mark_line().encode(
                    x='x', y='y').interactive()
                figure = figure + lines
        else:
            scatter = altair.Chart(all_apps_data_df).mark_point(size=60).encode(
                x='Кількість точок', y=plot['field'], color='Додаток', tooltip=TABLE_HEADERS).interactive()
            lines = altair.Chart(all_apps_data_df).mark_line().encode(
                x='Кількість точок', y=plot['field'], color='Додаток', tooltip=TABLE_HEADERS).interactive()
            figure = scatter + lines

        st.altair_chart(figure, use_container_width=True)
    if show_table:
        st.table(all_apps_data_df)

else:
    st.header('Використовуйте параметри для відображення результатів')
    st.image(str(IMAGE_PATH), width=500)
