---
slug: /use-bulkwriter-for-data-import
beta: FALSE
notebook: 07_use_bulk_import.ipynb
sidebar_position: 1
---



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

    :::info Notes    
    
    
    This guide uses the example dataset to demonstrate a common roadmap for data processing. The ultimate goal is to generate a list of dictionaries so that you can feed them to **BulkWriter**.

    :::

1. **Determine the schema:**
    - Decide on the schema for the collection you wish to import your dataset into. This involves selecting which fields to include from the dataset.

    ```python
    from pymilvus import FieldSchema, CollectionSchema
    
    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
        FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),   
        FieldSchema(name="title_vector", dtype=DataType.FLOAT_VECTOR, dim=768),
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
    import pandas as pd
    
    # Read the dataset into a data frame
    dataset = pd.read_csv("New_Medium_data.csv")
    
    # To retrieve a row from the dataset, do as follows:
    row = dataset.iloc[0].to_dict()
    row["title_vector"] = json.loads(row["title_vector"])
    ```

1. **Choose a writer:**
    - Opt between a **LocalBulkWriter** and a **RemoteBulkWriter** based on your needs. 

    - A **LocalBulkWriter** generates files in two types, either JSON or NumPy.

    ```python
    # Use LocalBulkWriter
    import json
    from pymilvus import LocalBulkWriter, BulkFileType
    
    # Instantiate a writer
    writer = LocalBulkWriter(
        schema=schema, # Schema of the target collection
        local_path='/tmp/output', # Output folder
        segment_size=4*1024*1024, # Maximum size of a generated data file in bytes
        file_type=BulkFileType.JSON_RB # Output file type
    )
    
    # Feed data rows to the writer
    for i in range(len(dataset)):
        try:
            row = dataset.iloc[i].to_dict()
            row["title_vector"] = json.loads(row["title_vector"])
            writer.append_row(row)
        except Exception as e:
            print(e)
            break;
    
    writer.commit()
    print(writer.data_path)
    
    # Output
    # /tmp/output/8f808cdc-ce4d-4aed-89b9-2f343d44b2e0
    ```

    - A **RemoteBulkWriter** generates only NumPy files and uploads them to the designated object storage bucket.
        **RemoteBulkWriter** uses MinIO’s Python Client, which is compatible with Amazon Web Services’ Simple Storage Service (AWS S3) and Google Cloud Storage (GCS). This allows you to write data to your AWS S3 and GCS buckets in bulk with ease.

        ```python
        # Use RemoteBulkWriter
        import json
        from pymilvus import RemoteBulkWriter
        
        # Connection parameters
        # The object storage bucket should be compatible with the MinIO Python SDK.
        connect_param = RemoteBulkWriter.ConnectParam(
            endpoint=MINIO_ADDRESS,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            bucket_name=YOUR_BUCKET_NAME,
        )
        
        # To connect to AWS S3
        # For details on creating IAM keys, refer to 
        # https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey
        #
        # connect_param = RemoteBulkWriter.ConnectParam(
        #     endpoint="s3.amazonaws.com",
        #     access_key=IAM_ACCESS_KEY,
        #     secret_key=IAM_SECRET_KEY,
        #     bucket_name=YOUR_BUCKET_NAME,
        # )
        
        # To connect to Google Cloud Storage
        # For details on creating HMAC keys, refer to 
        # https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create
        #
        # connect_param = RemoteBulkWriter.ConnectParam(
        #     endpoint="storage.googleapis.com",
        #     access_key=HMAC_ACCESS_KEY,
        #     secret_key=HMAC_SECRET_KEY,
        #     bucket_name=YOUR_BUCKET_NAME,
        # )
        
        # Instantiate a writer
        writer = RemoteBulkWriter(
            schema=schema, # Schema of the target collection
            remote_path="bulk_data", # Remote output folder relative to the root of the specified bucket
            local_path="/tmp/output", # Local output folder 
            segment_size=50*1024*1024, # Maximum size of a generated data file in bytes
            connect_param=connect_param, # Bucket connection
        )
        
        # Feed data rows to the writer
        for i in range(len(dataset)):
            try:
                row = dataset.iloc[i].to_dict()
                row["title_vector"] = json.loads(row["title_vector"])
                writer.append_row(row)
            except Exception as e:
                print(e)
                break;
        
        writer.commit()
        print(writer.data_path)
        
        # Output
        # A path relative to the designated bucket
        # /bulk_data/8f808cdc-ce4d-4aed-89b9-2f343d44b2e0
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

- For a **RemoteBulkWriter**, use `writer.data_path` to get the path to the generated files. Note that the path is relative to the designated object storage bucket. Take a MinIO instance as an example, you can use the following command to check the generated files.
    ```python
    > mc ls my-minio/a-bucket/bulk_data/8f808cdc-ce4d-4aed-89b9-2f343d44b2e0
    [2023-09-07 16:58:05 CST] 6.4KiB STANDARD claps.npy
    [2023-09-07 16:58:05 CST] 6.4KiB STANDARD id.npy
    [2023-09-07 16:58:05 CST] 441KiB STANDARD link.npy
    [2023-09-07 16:58:05 CST]  63KiB STANDARD publication.npy
    [2023-09-07 16:58:05 CST] 6.4KiB STANDARD reading_time.npy
    [2023-09-07 16:58:05 CST] 6.4KiB STANDARD responses.npy
    [2023-09-07 16:58:05 CST] 366KiB STANDARD title.npy
    [2023-09-07 16:58:05 CST] 4.7MiB STANDARD title_vector.npy
    ```

## Related topics{#related-topics}

- [Import Data on Web UI](./import-data-on-web-ui)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Import Data via SDKs](./import-data-via-sdks)
