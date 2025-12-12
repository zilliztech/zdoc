---
title: "Volume Explained | Cloud"
slug: /volume-explained
sidebar_label: "Volume Explained"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A volume is an object store that holds either structured data or collections of unstructured data files. It provides a unified place to access, store, govern, and organize these data assets. Structured and unstructured data from local file systems or cloud object storage are first uploaded into a volume in Zilliz Cloud. From there, you can import or migrate structured data directly into collections, or run ETL pipelines to transform unstructured data into embeddings and then load those embeddings into collections. | Cloud"
type: origin
token: H22PwQ4DxiwKrrkQxlac21WenRe
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - volume
  - LLMs
  - Machine Learning
  - RAG
  - NLP

---

import Admonition from '@theme/Admonition';


# Volume Explained

A volume is an object store that holds either structured data or collections of unstructured data files. It provides a unified place to access, store, govern, and organize these data assets. Structured and unstructured data from local file systems or cloud object storage are first uploaded into a volume in Zilliz Cloud. From there, you can import or migrate structured data directly into collections, or run ETL pipelines to transform unstructured data into embeddings and then load those embeddings into collections.

![DKAYwcIgJhudJnbw8Sbczhttntb](https://zdoc-images.s3.us-west-2.amazonaws.com/DKAYwcIgJhudJnbw8Sbczhttntb.png)

A volume belongs to a project, not to a single cluster. Any cluster in the same project can read/write it, subject to [project roles](./project-users#project-roles).

```bash
Organization
└─ Project
   ├─ Clusters
   │   └─ Databases
   │       └─ Collections
   └─ Volumes
       └─ Data files
```

## Use cases for volumes\{#use-cases-for-volumes}

You can use volumes for easier data processing. The following diagram shows the major application scenarios of Zilliz Cloud volumes.

![NRlhw8PMBhszdybIu6mcQro9npv](https://zdoc-images.s3.us-west-2.amazonaws.com/NRlhw8PMBhszdybIu6mcQro9npv.png)

You can use volumes in data import, data migration, and data merging, all of which need to fetch data from external sources but use the fetched data in different ways. 

- **Data import**

    During data import, you can upload prepared datasets into a volume and import them from the volume into a Zilliz Cloud collection. For details, refer to [Import Data (Console)](./import-data-on-web-ui#files-uploaded-to-a-volume), [Import Data (RESTful API)](./import-data-via-restful-api) and [Import Data (SDK)](./import-data-via-sdks).

- **Data migration**

    In data migration, you upload backup files of your Milvus instance into a volume and use the data in the volume to restore the Milvus instance as a Zilliz Cloud cluster. For details, refer to [Migrate from Milvus to Zilliz Cloud Via Backup Files](./via-backup-files).

- **Data merging**

    You can merge data from an existing Zilliz Cloud collection and that from a local file uploaded to a volume to create a collection that combines the data from both sources. For details, refer to [Merge Data](./merge-data).

## Billing\{#billing}

When you create a volume, you can choose either a **free trial volume** or a **pay-as-you-go volume**. The table below compares their typical use cases and limits.

<table>
   <tr>
     <th></th>
     <th><p>Free Trial</p></th>
     <th><p>Pay-as-you-go</p></th>
   </tr>
   <tr>
     <td><p>Use case</p></td>
     <td><p>For testing environments only.</p></td>
     <td><p>For production usage.</p></td>
   </tr>
   <tr>
     <td><p>Capacity</p></td>
     <td><p>5 GB</p></td>
     <td><p>Unlimited</p></td>
   </tr>
   <tr>
     <td><p>File size &amp; amount per upload</p></td>
     <td><p>Up to 1 GB of data and no more than 1,000 files in each upload</p></td>
     <td><p>Up to 100 GB of data and unlimited number of files in each upload</p></td>
   </tr>
   <tr>
     <td><p>Max. numbers volumes</p></td>
     <td><p>1</p></td>
     <td><p>100</p></td>
   </tr>
</table>

### Free trial volume\{#free-trial-volume}

- No payment method is required.

- Each organization can have only one free trial volume.

- The free trial volume is retained for 30 days and is then deleted automatically.

### Pay-as-you-go volume\{#pay-as-you-go-volume}

- A valid payment method is required.

- Using a pay-as-you-go volume incurs charges.

    - For list prices, see [Pricing Guide](http://zilliz.com/pricing/pricing-guide).

    - To understand how volume charges are calculated, see [Storage Cost](./storage-cost).

## FAQs\{#faqs}

1. **What happens to my volumes if my organization is frozen due to overdue invoices?**

    If an organization is frozen, all volumes—both free trial and pay-as-you-go volumes—and all files stored in them are deleted and cannot be restored.

    To continue using volumes, please first settle all outstanding invoices, then create new volumes and re-upload your files.

1. **Why can't I see the free trial volume option on the web console?**

    The free trial volume option is hidden once a free trial volume has been created for your organization. Each organization can create only one free trial volume.

