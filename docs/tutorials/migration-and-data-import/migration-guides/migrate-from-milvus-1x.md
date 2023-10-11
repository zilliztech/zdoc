---
slug: /migrate-from-milvus-1x
sidebar_position: 1
---



# Migrate from Milvus 1.x

Zilliz Cloud provides a cutting-edge data infrastructure for optimized search across vector embeddings, making it easy to bring your AI applications to life. As a Milvus user who wants to take advantage of this infrastructure, you are advised to migrate your data to Zilliz Cloud.

This guide will walk you through the process of preparing the migration data, performing the migration, and verifying the results.

## Prepare migration data{#prepare-migration-data}

Zilliz Cloud enables data migration from Milvus 1.x (including 0.9.x and above) and later versions. As a promising vector database, there are often significant changes between its releases.

To prepare migration data for Milvus 0.9.x through 1.x, you need to

1. Download the migration tool [milvus-migration](https://assets.zilliz.com/tools/milvus-migration). We recommend using the latest release of this tool. Please note that it is only applicable to CentOS 7.5 or higher, or Ubuntu LTS 18.04 or higher. For more information about installation prerequisites, refer to [milvus-migration](https://github.com/zilliztech/milvus-migration#prerequisites).

1. Stop the Milvus installation or at least stop performing any DML operations in it.

1. Export the metadata of the installation to `meta.json`.
    - For those installations using MySQL as the backend, run

    ```bash
    ./milvus-migration export -m "user:password@tcp(adderss)/milvus?charset=utf8mb4&parseTime=True&loc=Local" -o outputDir
    ```

    - For those installations using SQLite as the backend, run

    ```bash
    ./milvus-migration export -s /milvus/db/meta.sqlite -o outputDir
    ```

1. Copy the `tables` folder of your Milvus installation, then move both `meta.json` and the `tables` folder to an empty folder.
    Once this step is done, the structure of the empty folder should look like this:

    ```plaintext
    migration_data
    ├── meta.json
    └── tables
    ```

1. Upload the folder prepared in the preceding step to an S3 block storage bucket or directly use this local folder in the next section.

# **Migrate data to Zilliz Cloud**{#migrate-data-to-zilliz-cloud}

Once the migration data is ready, upload it to Zilliz Cloud.

![migration_procedure](/img/migration_procedure.png)

If you have uploaded the prepared migration data to a personal S3 block storage bucket, select **Import a folder from S3** and fill in the folder path and authentication credentials.

To upload a local folder to Zilliz Cloud, select **Import a local folder** and drag the folder to the drop zone. Note that you can upload a local folder of no more than 1 GB to Zilliz Cloud.

# **Verify the migration results**{#verify-the-migration-results}

After the status of the migration job changes from **MIGRATING** to **SUCCESSFUL**, the migration process ends.

![verify_collection](/img/verify_collection.png)

Zilliz Cloud only supports [AUTOINDEX](./autoindex-explained), an optimized indexing algorithm, and will automatically index your migrated collection using this algorithm.

After loading the collections, you can use the way of your choice to communicate with them.

## Related topics{#related-topics}

- [Migrate from Milvus 2.x](./migrate-from-milvus-2x) 

- [AUTOINDEX Explained](./autoindex-explained) 

- [CU Types Explained](./cu-types-explained-1) 

- [API Comparison](./api-comparison-between-zilliz-cloud-and-milvus) 

- [Other Differences](./other-differences) 
