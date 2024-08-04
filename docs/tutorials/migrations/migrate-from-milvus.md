---
title: "Migrate from Milvus | Cloud"
slug: /migrate-from-milvus
sidebar_label: "Migrate from Milvus"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud provides a cutting-edge data infrastructure for optimized search across vector embeddings, making it easy to bring your AI applications to life. If you are using Milvus and wish to leverage this advanced infrastructure, migrating your data to Zilliz Cloud is a recommended step. | Cloud"
type: origin
token: IO4fwm5fJiroaoktKeIcbdkDnRb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus

---

import Admonition from '@theme/Admonition';


# Migrate from Milvus

Zilliz Cloud provides a cutting-edge data infrastructure for optimized search across vector embeddings, making it easy to bring your AI applications to life. If you are using Milvus and wish to leverage this advanced infrastructure, migrating your data to Zilliz Cloud is a recommended step.

This guide will walk you through the process of preparing the migration data, performing the migration, and verifying the results.

## Prepare migration data{#prepare-migration-data}

To prepare migration data for Milvus 2.x, do as follows:

1. Download **[milvus-backup](https://github.com/zilliztech/milvus-backup/releases)**. Always use the latest release.

1. Create a **configs** folder side by side with the downloaded binary, and download **[backup.yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml)** into the **configs** folder.

    Once the step is done, the structure of your workspace folder should look like this:

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. Customize **backup.yaml**.

    In normal cases, you do not need to customize this file. But before going on, check whether the following configuration items are correct:

    - `milvus.address`

    - `mivlus.port`

    - `minio.address`

    - `minio.port`

    - `minio.bucketName`

    - `minio.backupBucketName`

    - `rootPath`

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p>For a Milvus instance installed using Docker Compose, <code>minio.bucketName</code> defaults to <code>a-bucket</code> and <code>rootPath</code> defaults to <code>files</code>.</p></li>
    <li><p>For a Milvus instance installed on Kubernetes, <code>minio.bucketName</code> defaults to <code>milvus-bucket</code> and <code>rootPath</code> defaults to <code>file</code>.</p></li>
    </ul>

    </Admonition>

1. Create a backup of your Milvus installation.

    ```plaintext
    ./milvus-backup --config backup.yaml create -n my_backup
    ```

1. Get the backup file.

    ```plaintext
    ./milvus-backup --config backup.yaml get -n my_backup
    ```

1. Check the backup files.

    - If you set `minio.address` and `minio.port` to an S3 bucket, your backup file are already in the S3 bucket.

    - If you set `minio.address` and `minio.port` to a Minio bucket, you can download them using Minio Console or the **mc** client. 

        - To download from [Minio Console](https://min.io/docs/minio/kubernetes/upstream/administration/minio-console.html), log into Minio Console, locate the bucket specified in `minio.address`, select the files in the bucket, and click **Download** to download them.

        - If you prefer [the ](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)**[mc](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)**[ client](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install), do as follows:

            ```plaintext
            # configure a Minio host
            mc alias set my_minio https://<minio_endpoint> <accessKey> <secretKey>
            
            # List the available buckets
            mc ls my_minio
            
            # Download a file from the bucket
            mc cp --recursive my_minio/<your-bucket-path> <local_dir_path>
            ```

1. Decompress the downloaded archive and upload only the content of the **backup** folder to Zilliz Cloud.

## Migrate data to Zilliz Cloud{#migrate-data-to-zilliz-cloud}

Once the migration data is ready, upload it to Zilliz Cloud.

![migration_procedure](/img/migration_procedure.png)

If you have uploaded the prepared migration data to a personal S3 block storage bucket, select **Import a folder from S3** and fill in the folder path and authentication credentials.

To upload a local folder to Zilliz Cloud, select **Import a local folder** and drag the folder to the drop zone. Note that you can upload a local folder of no more than 1 GB to Zilliz Cloud.

## Verify the migration results{#verify-the-migration-results}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the migration is complete.

![verify_collection](/img/verify_collection.png)

Note that Zilliz Cloud exclusively supports [AUTOINDEX](./autoindex-explained) for optimized indexing, and will automatically index your migrated collection using this algorithm.

Once the collections are loaded, you are free to interact with them using your preferred method.

## Related topics{#related-topics}

- [AUTOINDEX Explained](./autoindex-explained)

- [Select the Right CU](./cu-types-explained)

- [API Comparison](./api-comparison) 

