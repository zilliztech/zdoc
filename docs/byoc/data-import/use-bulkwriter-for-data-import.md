---
slug: /docs/byoc/use-bulkwriter-for-data-import
beta: FALSE
notebook: 06_use_remote-bulk-writer.ipynb
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Prepare Data Import

This guide walks you through the process of preparing your data for import into Zilliz Cloud using the **BulkWriter** tool in PyMilvus.

## Overview{#overview}

**BulkWriter** in PyMilvus is a script designed to convert datasets into a format suitable for importing data via various methods such as the Zilliz Cloud console, the **BulkInsert** APIs of Milvus SDKs, or the **Import** API in RESTful flavor. It offers two types of writers:

- **LocalBulkWriter**: Reads the designated dataset and transforms it into an easy-to-use format.

- **RemoteBulkWriter**: Performs the same task as the **LocalBulkWriter** but additionally transfers the converted data files to a specified object storage bucket.

The following table compares the two writers.

|                          |  **LocalBulkWriter**        |  **RemoteBulkWriter**       |
| ------------------------ | --------------------------- | --------------------------- |
|  Acceptable data format  |  A data row as a dictionary |  A data row as a dictionary |
|  Output data file format |  JSON or NumPy files        |  NumPy files                |

## Procedure{#procedure}

1. **Set up:**
    - Install the latest version of PyMilvus. For instructions on installation, refer to [Install SDKs](./install-sdks).

    - Download the example dataset from Kaggle. Visit [this link](https://www.kaggle.com/datasets/shiyu22chen/cleaned-medium-articles-dataset), log in, and click the **Download** button in the upper right corner.

    <Admonition type="info" icon="📘" title="Notes">    
    
    
    This guide uses the example dataset to demonstrate a common roadmap for data processing. The ultimate goal is to generate a list of dictionaries so that you can feed them to **BulkWriter**.

    </Admonition>

1. **Determine the schema:**
    - Decide on the schema for the collection you wish to import your dataset into. This involves selecting which fields to include from the dataset.

    ```python
    import os, json
    
    import pandas as pd
    
    from pymilvus import (
        FieldSchema,
        CollectionSchema,
        DataType
    )
    
    # You need to work out a collection schema out of your dataset.
    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
        FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=768),
        FieldSchema(name="link", dtype=DataType.VARCHAR, max_length=512),
        FieldSchema(name="reading_time", dtype=DataType.INT64),
        FieldSchema(name="publication", dtype=DataType.VARCHAR, max_length=512),
        FieldSchema(name="claps", dtype=DataType.INT64),
        FieldSchema(name="responses", dtype=DataType.INT64)
    ]
    
    schema = CollectionSchema(fields)
    ```

1. **Process your dataset:**
    Process your dataset to match the collection schema you've defined. You can manipulate your dataset in any way you prefer, but the final output must be a list of dictionaries with each dictionary representing a row. This guide uses the Pandas library to process the example dataset in the following steps.

    1. First, the example dataset is read into a data frame.

    1. Then, a specific row in the data frame is located by its index and converted into a dictionary for the **BulkWriter** to consume later.

    1. Finally, the vector field is loaded to ensure that it is correctly parsed as a list of floats.

    ```python
    # Load the dataset
    dataset = pd.read_csv(Path(DATASET_PATH))
    
    # To retrieve a row from the dataset, do as follows:
    # row = dataset.iloc[0].to_dict()
    # row["title_vector"] = json.loads(row["title_vector"])
    ```

1. **Choose a writer:**
    - Opt between a **LocalBulkWriter** and a **RemoteBulkWriter** based on your needs. 

    - A **LocalBulkWriter** generates files in two types, either JSON or NumPy.

    ```python
    # Use LocalBulkWriter
    import json
    from pymilvus import LocalBulkWriter, BulkFileType
    from pathlib import Path
    DATASET_PATH = "{}/../New_Medium_Data.csv".format(os.path.dirname(__file__))
    OUTPUT_PATH = "{}/../output".format(os.path.dirname(__file__))
    
    # Rewrite the above dataset into a JSON file
    local_writer = LocalBulkWriter(
        schema=schema,
        local_path=Path(OUTPUT_PATH).joinpath('json'),
        segment_size=4*1024*1024,
        file_type=BulkFileType.JSON_RB
    )
    
    for i in range(0, len(dataset)):
      row = dataset.iloc[i].to_dict()
      row["vector"] = json.loads(row["vector"])
      local_writer.append_row(row)
    
    local_writer.commit()
    print("test local writer done!")
    
    # Output
    #
    # test local writer done!
    
    
    print(os.path.relpath(local_writer.data_path))
    
    # Output
    #
    # output/json/09ce63fa-9fd8-4ac6-b915-5e6b0ded2ff5
    
    
    
    # Check what you have in the `output` folder
    print(os.listdir(local_writer.data_path))
    
    # Output
    #
    # ["1.json", "2.json", "3.json", "4.json", "5.json"]
    ```

    - A **RemoteBulkWriter** generates only NumPy files and uploads them to the designated object storage bucket.
        **RemoteBulkWriter** uses MinIO’s Python Client, which is compatible with Amazon Web Services’ Simple Storage Service (AWS S3) and Google Cloud Storage (GCS). This allows you to write data to your AWS S3 and GCS buckets in bulk with ease.

        ```python
        # Use RemoteBulkWriter
        from pathlib import Path
        import os, json
        
        import pandas as pd
        from minio import Minio
        
        from pymilvus import (
            FieldSchema, CollectionSchema, DataType,
            RemoteBulkWriter,
        )
        
        ACCESS_KEY = "YOUR_OBJECT_STORAGE_ACCESS_KEY"
        SECRET_KEY = "YOUR_OBJECT_STORAGE_SECRET_KEY"
        BUCKET_NAME = "YOUR_OBJECT_STORAGE_BUCKET_NAME"
        REMOTE_PATH = "DATA_FILES_PATH_IN_BLOCK_STORAGE"
        DATASET_PATH = "{}/../New_Medium_Data.csv".format(os.path.dirname(__file__))
        
        # Extract the ID from the share link of the dataset file.
        # For a file at https://drive.google.com/file/d/12RkoDPAlk-sclXdjeXT6DMFVsQr4612w/view?usp=drive_link, the ID should be 12RkoDPAlk-sclXdjeXT6DMFVsQr4612w.
        # Concatenate the file ID to the end of the url as follows:
        
        url = Path(DATASET_PATH)
        dataset = pd.read_csv(url)
        
        connect_param = RemoteBulkWriter.ConnectParam(
            endpoint="storage.googleapis.com", # use 's3.amazonaws.com' for GCS
            access_key=ACCESS_KEY,
            secret_key=SECRET_KEY,
            bucket_name=BUCKET_NAME,
            secure=True
        )
        
        remote_writer = RemoteBulkWriter(
            schema=schema,
            remote_path=REMOTE_PATH,
            segment_size=50*1024*1024,
            connect_param=connect_param,
        )
        
        for i in range(0, len(dataset)):
          row = dataset.iloc[i].to_dict()
          row["vector"] = json.loads(row["vector"])
          remote_writer.append_row(row)
        
        remote_writer.commit()
        
        print(remote_writer.data_path)
        
        # Output
        #
        # /DATA_FILES_PATH_IN_BLOCK_STORAGE/62391da7-e40f-439a-ba11-ddddb936223b
        ```

## Dynamic schema support{#dynamic-schema-support}

To generate data for a collection that has dynamic schema enabled, change the `enable_dynamic_field` attribute of the `CollectionSchema` object to `True`.

```python
from pymilvus import FieldSchema, CollectionSchema

fields = [
    ...
]

schema = CollectionSchema(fields, enable_dynamic_field=True)
```

## Verify the result{#verify-the-result}

To check the results, you can do as follows:

- For a **LocalBulkWriter**, use `writer.data_path` to get the path to the generated files.

- For a **RemoteBulkWriter**, use `remote_writer.data_path` to get the path to the generated files. Note that the path is relative to the designated object storage bucket. Take a MinIO instance as an example, you can use the following command to check the generated files.
    ```python
    # To check the files in the remote folder
    
    client = Minio(
        endpoint="storage.googleapis.com", # use 's3.amazonaws.com' for AWS
        access_key=ACCESS_KEY,
        secret_key=SECRET_KEY,
        secure=True)
    
    objects = client.list_objects(
        bucket_name=BUCKET_NAME,
        prefix=str(remote_writer.data_path)[1:],
        recursive=True
    )
    
    print([obj.object_name for obj in objects])
    
    # Output
    #
    # [
    #     "DATA_FILES_PATH_IN_BLOCK_STORAGE/62391da7-e40f-439a-ba11-ddddb936223b/1/claps.npy",
    #     "DATA_FILES_PATH_IN_BLOCK_STORAGE/62391da7-e40f-439a-ba11-ddddb936223b/1/id.npy",
    #     "DATA_FILES_PATH_IN_BLOCK_STORAGE/62391da7-e40f-439a-ba11-ddddb936223b/1/link.npy",
    #     "DATA_FILES_PATH_IN_BLOCK_STORAGE/62391da7-e40f-439a-ba11-ddddb936223b/1/publication.npy",
    #     "DATA_FILES_PATH_IN_BLOCK_STORAGE/62391da7-e40f-439a-ba11-ddddb936223b/1/reading_time.npy",
    #     "DATA_FILES_PATH_IN_BLOCK_STORAGE/62391da7-e40f-439a-ba11-ddddb936223b/1/responses.npy",
    #     "DATA_FILES_PATH_IN_BLOCK_STORAGE/62391da7-e40f-439a-ba11-ddddb936223b/1/title.npy",
    #     "DATA_FILES_PATH_IN_BLOCK_STORAGE/62391da7-e40f-439a-ba11-ddddb936223b/1/vector.npy"
    # ]
    ```

## Related topics{#related-topics}

- [Import Data on Web UI](./import-data-on-web-ui)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Import Data via SDKs](./import-data-via-sdks)
