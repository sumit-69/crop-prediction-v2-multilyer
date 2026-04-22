import pandas as pd
import os

_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'district wise rainfall normal.csv')
_df = None


def _load():
    global _df
    if _df is None:
        _df = pd.read_csv(_DATA_PATH)
    return _df


def get_states():
    df = _load()
    return sorted(df['STATE_UT_NAME'].unique().tolist())


def get_districts(state: str):
    df = _load()
    districts = df[df['STATE_UT_NAME'] == state]['DISTRICT'].unique().tolist()
    return sorted(districts)


def get_rainfall(state: str, district: str, month: str):
    df = _load()
    month = month.upper()[:3]
    row = df[(df['STATE_UT_NAME'] == state) & (df['DISTRICT'] == district)]
    if row.empty:
        raise Exception(f"No data found for state: {state}, district: {district}")
    rainfall = row[month].values
    if rainfall.shape[0] == 0:
        raise Exception(f"No rainfall data for month: {month}")
    return rainfall[0]
