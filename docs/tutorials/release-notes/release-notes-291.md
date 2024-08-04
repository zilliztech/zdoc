---
title: "Release Notes (Jul 23, 2024) | Cloud"
slug: /release-notes-291
sidebar_label: "Release Notes (Jul 23, 2024)"
beta: FALSE
notebook: FALSE
description: "In this update, Zilliz Cloud now supports Milvus' new RESTful API v2, providing a consistent interface and expanded functionalities. A new documentation chatbot enhances user support. The Job Center introduces an intuitive interface for managing and tracking tasks such as backup, restore, migration, import, and clone collection. Auto-scaling for dedicated clusters, available in private preview, dynamically adjusts capacity based on demand, triggered by the Compute Unit (CU) Capacity Threshold. Other enhancements include more cluster monitoring metrics, a revamped cluster management interface, and improved user email templates. | Cloud"
type: origin
token: RlhDw3Fr9iCpWSkylfAcyes1nLh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes

---

import Admonition from '@theme/Admonition';


# Release Notes (Jul 23, 2024)

In this update, Zilliz Cloud now supports Milvus' new RESTful API v2, providing a consistent interface and expanded functionalities. A new documentation chatbot enhances user support. The **Job Center** introduces an intuitive interface for managing and tracking tasks such as backup, restore, migration, import, and clone collection. **Auto-scaling** for dedicated clusters, available in private preview, dynamically adjusts capacity based on demand, triggered by the Compute Unit (CU) Capacity Threshold. Other enhancements include more cluster monitoring metrics, a revamped cluster management interface, and improved user email templates.

## Milvus Compatibility{#milvus-compatibility}

This release is compatible with **Milvus 2.3.x**. 

If you prefer to upgrade your clusters to BETA, **Milvus 2.4.x** features are available after the upgrade.

### RESTful API v2{#restful-api-v2}

In the recent Milvus 2.4 update, the new RESTful API v2 has been launched. With this release, Zilliz Cloud now fully supports these APIs and offers a set of control plane interfaces. The new v2 APIs are more consistent in interface style and cover a wider range of functions compared to v1. These functions include vector operations, collection management, index management, partition management, role and user management, and alias operations on the data plane. On the control plane, the APIs cover data import and cluster management. See RESTful v2 [control plane API](/reference/restful/control-plane-v2) and [data plane API](/reference/restful/data-plane-v2) for more details.

### Chatbot{#chatbot}

Zilliz Cloud now features a documentation chatbot, offering a more flexible and powerful support tool compared to the traditional search bar. This chatbot allows users to easily find information and get assistance with their questions. You can access the chatbot by clicking on the icon located in the bottom right corner of the Zilliz Cloud documentation page.

### Job Center{#job-center}

Zilliz Cloud now offers an intuitive Jobs page, integrating all historical and asynchronous data tasks within a single project. This streamlined interface allows you to easily track the progress and manage various types of jobs, including:

- Backup

- Restore

- Migration

- Import

- Clone Collection

See [Manage Project Jobs](./job-center) for details.

### Auto-scaling for Dedicated Clusters [Private Preview]{#auto-scaling-for-dedicated-clusters-private-preview}

Zilliz Cloud introduces auto-scaling, a feature that dynamically adjusts the cluster's capacity based on demand. Auto-scaling is primarily triggered by the CU (Compute Unit) Capacity Threshold. Zilliz Cloud monitors the cluster's CU capacity every minute, and if it exceeds 70% (the default threshold) for two consecutive minutes, the system automatically initiates a scaling process. Users can set a maximum CU size for automatic scaling, though downward auto-scaling is currently not supported.

Auto-scaling is currently in private preview and available only for Dedicated (Enterprise) clusters. To enable this feature, please [contact us](https://zilliz.com/contact-sales?_gl=1*y9u24o*_ga*NDAwNDA1MDY5LjE3MDkxNTcwNzU.*_ga_KKMVYG8YF2*MTcyMTcwNjA5MC4xMjQuMS4xNzIxNzA5OTk3LjAuMC4w*_ga_HT329313WV*MTcyMTcwNjA5MC4zNS4xLjE3MjE3MDk5OTcuMC4wLjA.*_ga_Q1F8R2NWDP*MTcyMTcwNjA5MC4zMy4xLjE3MjE3MDk5OTcuMC4wLjA.*_gcl_au*ODIwMjEwMjY0LjE3MTcwNjEwOTc.). See [Auto-scaling](./manage-cluster#manage-and-configure-clusters) for the usage.

### Pipelines{#pipelines}

- Pipelines now support searching images by text with the new SEARCH_IMAGE_BY_TEXT function. This feature enables users to retrieve relevant image data from the database by inputting a text query. The search functionality supports multiple languages and utilizes the CLIP vit base patch32 multimodal model for text and image encoding. For details, refer to [Image Data](./pipelines-image-data).

- Users can now obtain pipeline usage information in pipeline details using both the RestFul API and the UI console. This enhancement provides users with a comprehensive view of pipeline usage for better monitoring and analysis. For details, refer to [Estimate Pipeline Usage](./estimate-pipelines-usage).

- The limit on the maximum number of each type of pipelines in each project has been increased. Users can now create up to 100 pipelines of every kind in a single project, compared to the previous limit of 10. This change allows for more flexibility and scalability in managing pipelines within projects. For details on all pipeline limits, refer to [Zilliz Cloud Limits on Pipelines](./estimate-pipelines-usage).

### Enhancements{#enhancements}

This release also includes a series of enhancements:

- More [metrics](/docs/metrics-alerts-reference) for monitoring your clusters

- Refactor of the cluster management pages, including cluster modification, migration, and backup.

- Refinement of user email templates

