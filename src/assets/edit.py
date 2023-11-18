import pandas as pd

df = pd.read_csv(r'C:\Users\callu\OneDrive\Documents\coding\ldn_cycling_accidents_react\ldn_cycling_accidents\src\assets\final_cycling_data_v2.csv')
df.columns
df.groupby('casualty_age_banded').weather.count()