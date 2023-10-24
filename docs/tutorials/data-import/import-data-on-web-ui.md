---
slug: /import-data-on-web-ui
beta: FALSE
notebook: FALSE
sidebar_position: 2
---



# Import Data on Web UI

This tutorial guides you through the process of importing data into an existing collection on the web UI.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have created a serverless or dedicated cluster. For details, see [Create Cluster](./create-cluster).

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset-1).

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details, see [Use Customized Schema](./create-collection-with-schema).

## Prepare data files{#prepare-data-files}

Zilliz Cloud allows you to import data from a local file or one or more remote files. The supported data types are JSON and NumPy. If your data is in a different format, you can first convert it using the BulkWriter conversion tool. For details, see [Use BulkWriter for Data Import](./prepare-data-import).

### Prepare a local JSON file{#prepare-a-local-json-file}

Zilliz Cloud only supports importing data from local files in JSON format. You can upload only one JSON file per import. The maximum file size allowed varies depending on the cluster type. For a serverless cluster, the maximum file size is 512 MB. For a dedicated cluster, the maximum file size is 1 GB. For more information on cluster types, see [Cluster Types Explained](./cluster-types-explained).

The [example dataset](./example-dataset-1) used in this tutorial is a row-based JSON file that can be directly imported locally.

However, in real-world scenarios, you may need to import multiple files simultaneously or import larger data files. In such cases, we recommend preparing remote files.

### Prepare remote files{#prepare-remote-files}

Importing data from remote files supports both JSON and NumPy formats. When preparing remote files, note that:

- When importing JSON data, each import only supports one JSON file. This means that you cannot upload multiple JSON files at once.

- For NumPy data, you have the option to upload multiple files at once or organize these files into a folder with no more than two subfolders and upload them in a batch. Note that each subfolder cannot exceed 10 GB in size, and the maximum size for the parent folder is 100 GB.

- When organizing multiple files in a folder, ensure that data types are consistent for all files inside the folder, and that the folder contains no more than two subfolders. If a folder contains both JSON and NumPy data, or more than two subfolders, an error will occur during data import. If a folder contains NumPy files and other unsupported data types, Zilliz Cloud will only import the NumPy files and ignore the unsupported files. For example, you can specify a valid path similar to **/dataset1/** or **/dataset2/sub/**.

To convert the example dataset into multiple NumPy files, use the following code:

```python
import json
import numpy

with open('path/to/medium_articles_2020_dpr.json') as f:
    dataset = json.load(f)
    keys = dataset['rows'][0].keys()

    for key in keys:
        numpy.save(f'{key}.npy', numpy.array([ x[key] for x in dataset['rows'] ]))

    # For JSON fields, you should dump the field values before saving them
    # numpy.save(f'json_field.npy', numpy.array([
    #     json.dumps({"year": 2015, "price": 23.43}),
    #     json.dumps({"year": 2018, "price": 15.05}),
    #     json.dumps({"year": 2020, "price": 36.68}),
    #     json.dumps({"year": 2019, "price": 20.14}),
    #     json.dumps({"year": 2021, "price": 9.36}))
    # ]))
```

## Import data on the web UI{#import-data-on-the-web-ui}

Once the data files are ready, you can import them directly from your local drive or upload them to an object storage bucket, such as AWS S3 or Google Cloud GCS, for data imports.

:::info Notes

:::

### Import the local JSON file{#import-the-local-json-file}

To import data, you can either drag and drop a local file into the upload area, or click **upload a file** and select the file.

![import_data_from_local_files](/img/import_data_from_local_files.png)

### Import remote files from an object storage bucket{#import-remote-files-from-an-object-storage-bucket}

To import remote files, you must first upload them to the bucket. You can upload a JSON file or a group of NumPy files to the bucket. Once uploaded, fill in the file path and bucket credentials for Zilliz Cloud to pull data from your bucket.

To import NumPy files in a batch, provide the path to the folder containing all the NumPy files, for example, **/mydata/np/**.

For supported object paths, see [Supported object paths](./import-data-on-web-ui#supported-object-paths).

![import_data_from_object_storage](/img/import_data_from_object_storage.png)

### Supported object paths{#supported-object-paths}

If you are importing data from AWS S3, you can use either S3 URI or object URL. The following are some examples:

- s3://bucket-name/key-name (AWS S3 URI)

- [https://bucket-name.s3.region-code.amazonaws.com/key-name](https://bucket-name.s3.region-code.amazonaws.com/key-name) (AWS Object URL, virtual-hosted–style)

- [https://s3.region-code.amazonaws.com/bucket-name/key-name](https://s3.region-code.amazonaws.com/bucket-name/key-name) (AWS Object URL, path-style)

For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

If you are importing data from Google Cloud Storage (GSC), you can use either authenticated URL, public URL, or gsutilURI. The following are some examples:

- [https://storage.googleapis.com/YOUR_BUCKET_NAME/OBJECT_NAME](https://storage.googleapis.com/YOUR_BUCKET_NAME/OBJECT_NAME) (GSC public URL)

- gs://YOUR_BUCKET_NAME/OBJECT_NAME (GSC gsutilURI)

For more details, see [Share the object](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object).

## Verify the result{#verify-the-result}

After you click **Import**, the process starts, and you can view the import progress in real-time.

![data_import_progress](/img/data_import_progress.png)

After the import is complete, you will receive the following information. At this point, you can view job details or start exploring the imported data for what interests you.

![data_import_complete](/img/data_import_complete.png)

