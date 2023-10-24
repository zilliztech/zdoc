---
slug: /use-bulkwriter-for-data-import
beta: FALSE
notebook: 07_use_bulk_import.ipynb
sidebar_position: 1
---



# Prepare Data Import

This guide explains how to use **BulkWriter** in PyMilvus to prepare for data import into Zilliz Cloud.

## Overview{#overview}

**BulkWriter** is a PyMilvus script that converts datasets into a format suitable for importing data via various methods such as the Zilliz Cloud console, the **BulkInsert** APIs of Milvus SDKs, or the **Import** API in RESTful flavor.

The tool offers two categories of writers: **LocalBulkWriter** and **RemoteBulkWriter**. A **LocalBulkWriter** reads the designated dataset and transforms it into a format that is easy to use. On the other hand, a **RemoteBulkWriter** carries out the same task but also transfers the converted data files to the designated object storage bucket. The following table compares these two writers.

## Procedure{#procedure}

To use **BulkWriter**, follow these steps:

1. Install the latest PyMilvus and get your dataset.
    - To install the latest PyMilvus or upgrade your PyMilvus to the latest version, refer to xx.

    - To download the example dataset in CSV format from Kaggle, visit [this link](https://www.kaggle.com/datasets/shiyu22chen/cleaned-medium-articles-dataset), log in, and click the **Download** button in the upper right corner.

    :::info Notes    
    
    
    This guide uses the example dataset to demonstrate a common roadmap for data processing. The ultimate goal is to generate a list of dictionaries so that you can feed them to **BulkWriter**.

    :::

1. Determine the schema of the collection you wish to import your dataset into.
    To determine a collection schema, you must select which fields to include from the dataset.

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

1. Use the collection schema as a blueprint to process your dataset so that you can feed the rows in the dataset to the **BulkWriter** one after another.
    You can manipulate your dataset in any way you prefer, but the final output must be a list of dictionaries with each dictionary representing a row.

    This guide uses the Pandas library to process the example dataset in the following steps.

1. Choose between a **LocalBulkWriter** and a **RemoteBulkWriter**, depending on your needs. 
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

To generate data

## Verification{#verification}

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