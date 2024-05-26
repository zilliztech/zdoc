---
slug: /connectors
beta: FALSE
notebook: FALSE
type: origin
token: UcAvwL6N0iAq7bkuDcQcJgWqn3b
sidebar_position: 3

---

import Admonition from '@theme/Admonition';


# Connect to Your Data

The connector is an in-built tool that makes it easy to connect various data sources to a vector database. This guide will explain the concept of a connector and provide instructions on how to create and manage connectors in Zilliz Cloud Pipelines.

## Understanding Connectors{#understanding-connectors}

A connector is a tool for ingesting data to Zilliz Cloud from various data sources, including Object Storage, Kafka (coming soon) and more. Taking object storage connector as an example, a connector can monitor a diretory in object storage bucket and sync files such as PDFs and HTMLs to Zilliz Cloud Pipelines, so that they can be converted to vector representation and stored in vector database for search. With ingestion and deletion pipelines, the files and their vector representation in Zilliz Cloud are kept in sync. Any addition or removal of files in the object storage will be mapped to the vector database collection.

![connector-overview](/img/connector-overview.png)

### Why use a connector?{#why-use-a-connector}

1. **Real-time Data Ingestion**

Effortlessly ingest and index data in real-time, guaranteeing that the freshest content is instantly accessible for all search inquiries.

1. **Scalable and Adaptive**

Easily scale up your data ingestion pipeline with zero DevOps hassle. The adaptive connectors seamlessly handle fluctuating traffic loads, ensuring smooth scalability.

1. **Search Index Kept in Sync With Heterogeneous Sources**

Automatically sync the addition and deletion of documents to the search index. Moreover, fuse all common types of data source (coming soon).

1. **Observability**

Gain insight into your dataflow with detailed logging, ensuring transparency and detecting any anomalies that may arise.

## Create Connector{#create-connector}

Zilliz Cloud Pipelines provides flexible options when you create a connector. Once a connector is created, it will periodically scan your data sources and ingest data into your vector database at regular intervals.

### Prerequisites{#prerequisites}

- Ensure you have [created a collection](./manage-collections-console#create-collection).

- Ensure the created collection has a doc ingestion pipeline and deletion pipeline(s).

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, Zilliz Cloud Connector only supports processing doc data.</p>

</Admonition>

### Procedures{#procedures}

1. Navigate to your project. Click on **Pipelines** from the navigation panel. Then switch to the **Connectors** tab. Click **+ Connectors**.

    ![create-connector](/img/create-connector.png)

1. Link to your data source.

    1. Set up the basic information of the connector. 

        <table>
           <tr>
             <th><strong>Parameter</strong></th>
             <th><strong>Description</strong></th>
           </tr>
           <tr>
             <td>Connector Name</td>
             <td>The name of the connector to create.</td>
           </tr>
           <tr>
             <td>Description (optional)</td>
             <td>The description of the connector.</td>
           </tr>
        </table>

    1. Configure the data source information.

        <table>
           <tr>
             <th><strong>Parameter</strong></th>
             <th><strong>Description</strong></th>
           </tr>
           <tr>
             <td>Object Storage Service</td>
             <td>Select the object storage service of your data source. Available options include: <br/> - AWS S3<br/> - Google Cloud Storage.<br/></td>
           </tr>
           <tr>
             <td>Bucket URL</td>
             <td>Provide the bucket URL used for accessing your source data. Please make sure you enter the URL of the file directory instead of a specific file.<br/> To learn more about how to obtain the URL, please refer to:<br/> - <a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html">Accessing and listing an Amazon S3 bucket</a><br/> - <a href="https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object">Discover object storage with the Google Cloud console</a><br/></td>
           </tr>
           <tr>
             <td>Access Keys for authorization (optional)</td>
             <td>Provide the following information for authorization if necessary:<br/> - For AWS S3, please provide the <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey">access key and secret key</a>.<br/> - For Google Cloud Storage, please provide the <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys">access key ID and secret access key</a>.<br/></td>
           </tr>
        </table>

        Click **Link and Continue** to proceed to the next step.

        <Admonition type="info" icon="📘" title="Notes">

        <p>Zilliz Cloud will verify the connection to your data source before moving to the next step.</p>

        </Admonition>

        ![link-data-source](/img/link-data-source.png)

1. Add target Pipelines. 

    First, choose a target cluster, then a collection with one ingestion pipeline and deletion pipeline(s). The target ingestion pipeline should **only** have an INDEX_DOC function. If multiple deletion pipelines are available, select the appropriate one manually.

    <Admonition type="info" icon="📘" title="Notes">

    <p>This step can be skipped and completed later before initiating a scan.</p>

    </Admonition>

    ![add-target-pipelines](/img/add-target-pipelines.png)

1. Choose whether to enable auto scan. 

    - When it is disabled, you will need to manually trigger a scan if there are any updates to the source data.

    - When it is enabled, Zilliz Cloud will periodically scan the data source and sync the file addition/deletion to vector database collection through the designated ingestion/deletion pipelines. You will need to set up the auto scan schedule.

        <table>
           <tr>
             <th><strong>Parameter</strong></th>
             <th><strong>Description</strong></th>
           </tr>
           <tr>
             <td>Frequency</td>
             <td>Set how often the system performs scans.<br/> - Daily: Choose any number from 1 to 7.<br/> - Hourly: Options are 1, 6, 12, or 18 hours.<br/></td>
           </tr>
           <tr>
             <td>Next Run at</td>
             <td>Specify the time for the next scan. The time zone is consistent with the <a href="./manage-timezone">system time zone</a> in organization settings.</td>
           </tr>
        </table>

        ![enable-auto-scan](/img/enable-auto-scan.png)

1. Click **Create**.

## Manage Connector{#manage-connector}

Managing connectors efficiently is integral to maintaining a smooth data integration process. This guide provides detailed instructions on how to manage connectors.

### Enable or disable a connector{#enable-or-disable-a-connector}

1. Locate the connector you want to manage.

1. Click **...** under **Actions**.

1. Choose **Enable** or **Disable**.

<Admonition type="info" icon="📘" title="Notes">

<p>To activate a connector, ensure the target pipelines are configured. </p>

</Admonition>

![enable-connector](/img/enable-connector.png)

### Trigger a manual scan{#trigger-a-manual-scan}

Perform a manual scan if the auto scan feature is off. 

Click "**...**" under **Actions** next to the target connector, then click **Scan**.

<Admonition type="info" icon="📘" title="Notes">

<p>Ensure the connector is enabled before initiating a manual scan.</p>

</Admonition>

### Configure a connector{#configure-a-connector}

You can modify the following settings of a connector:

- Storage bucket access credentials:

    - (For AWS S3) access key and secret key

    - (For Google Cloud Storage) access key ID and secret access key

- Auto scan schedule. For more information, refer to step 4 in [the procedure for creating connectors](./connectors#procedures).

![configure-connector](/img/configure-connector.png)

### Drop a connector{#drop-a-connector}

You can drop a connector if it is no longer necessary.

<Admonition type="info" icon="📘" title="Notes">

<p>The connector must be disabled before being dropped.</p>

</Admonition>

![drop-connector](/img/drop-connector.png)

### View connector logs{#view-connector-logs}

Monitor connector activities and troubleshoot issues:

1. Access the connector's activity page to view logs.

    ![view-connector-logs](/img/view-connector-logs.png)

1. An `abnormal` status indicates an error. Click the "?" icon next to the status for detailed error messages.

