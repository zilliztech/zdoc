---
slug: /create-connectors
beta: FALSE
notebook: FALSE
type: origin
token: FreNwlcuIi8yhCkbZYkclJEknAh
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Create Connectors

The process of creating connectors is crucial in integrating various data sources into your Zilliz Cloud Pipelines. This guide walks you through the process of setting up connectors on the Zilliz Cloud web UI.

## Prerequisites{#prerequisites}

- Ensure you have [created a collection](./manage-collections-console#create-collection).

- Ensure the created collection has [an ingestion pipeline](./create-ingestion-piplines) and [deletion pipeline(s)](./create-deletion-pipelines).

## Procedures{#procedures}

1. Navigate to your project. Click on __Pipelines__ from the navigation panel. Then switch to the__ Connectors __tab. Click __+ Connectors__.

    ![create-connector](/img/create-connector.png)

1. Link to your data source.

    1. Set up the basic information of the connector.

        |  __Parameter__          |  __Description__                      |
        | ----------------------- | ------------------------------------- |
        |  Connector Name         |  The name of the connector to create. |
        |  Description (optional) |  The description of the connector.    |

    1. Configure the data source information.

        |  __Parameter__                            |  __Description__                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
        | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
        |  Object Storage Service                   |  Select the object storage service of your data source. Available options include: <br/> - AWS S3<br/> - Google Cloud Storage.<br/>                                                                                                                                                                                                                                                                                                                                                                                  |
        |  Bucket URL                               |  Provide the bucket URL used for accessing your source data. Please make sure you enter the URL of the file directory instead of a specific file.<br/> To learn more about how to obtain the URL, please refer to:<br/> - [Accessing and listing an Amazon S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html)<br/> - [Discover object storage with the Google Cloud console](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object)<br/> |
        |  Access Keys for authorization (optional) |  Provide the following information for authorization if necessary:<br/> - For AWS S3, please provide the [access key and secret key](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey).<br/> - For Google Cloud Storage, please provide the [access key ID and secret access key](https://cloud.google.com/storage/docs/authentication/managing-hmackeys).<br/>                                                                                                |

        Click __Link and Continue__ to proceed to the next step.

        <Admonition type="info" icon="📘" title="Notes">

        <p>Zilliz Cloud will verify the connection to your data source before moving to the next step.</p>

        </Admonition>

        ![link-data-source](/img/link-data-source.png)

1. Add target Pipelines. 

    First, choose a target cluster, then a collection with one ingestion pipeline and deletion pipeline(s). The target ingestion pipeline should __only__ have an INDEX_DOC function. If multiple deletion pipelines are available, select the appropriate one manually.

    <Admonition type="info" icon="📘" title="Notes">

    <p>This step can be skipped and completed later before initiating a scan.</p>

    </Admonition>

    ![add-target-pipelines](/img/add-target-pipelines.png)

1. Choose whether to enable auto scan. 

    - When it is disabled, you will need to manually trigger a scan if there are any updates to the source data.

    - When it is enabled, Zilliz Cloud will periodically scan the data source and sync the file addition/deletion to vector database collection through the designated ingestion/deletion pipelines. You will need to set up the auto scan schedule.

        |  __Parameter__ |  __Description__                                                                                                                                        |
        | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
        |  Frequency     |   Set how often the system performs scans.<br/> - Daily: Choose any number from 1 to 7.<br/> - Hourly: Options are 1, 6, 12, or 18 hours.<br/> |
        |  Next Run at   |  Specify the time for the next scan. The time zone is consistent with the [system time zone](./manage-timezone) in organization settings.               |

        ![enable-auto-scan](/img/enable-auto-scan.png)

1. Click __Create__.

