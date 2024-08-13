import json
import pandas as pd
from io import StringIO
import os
# Load the JSON data
rootDir = './output'

# go through all the files in the output folder
for dirName, subdirList, fileList in os.walk(rootDir):
    for fname in fileList:
        if fname.endswith('.json'):
            file_path = os.path.join(dirName, fname)
            file_name = file_path.split('/')[-1]
            file_name = file_name.split('.')[0]

            with open(file_path, 'r') as file:
                json_data = json.load(file)

            # Extract the CSV string from the JSON
            csv_data = json_data["HERO9 Black-ACCL"]

            # Load the CSV data into a DataFrame
            df = pd.read_csv(StringIO(csv_data))

            # Select the columns needed and rename them
            df = df.rename(columns={'Accelerometer [m/s²]': 'value', 'cts': 'cts', 'date': 'date'})

            # Convert the 'date' column to epoch timestamp
            df['epoch'] = pd.to_datetime(df['date']).astype(int) 

            # Save to CSV
            output_csv_path = f'./output/{file_name}.csv'
            df.to_csv(output_csv_path, index=False)

            print(f"CSV file saved to {output_csv_path}")
