---
title: "Release Notes (April 6, 2023) | Cloud"
slug: /release-notes-110
sidebar_label: "Release Notes (April 6, 2023)"
beta: FALSE
notebook: FALSE
description: "We're thrilled to unveil the newest Zilliz Cloud update, featuring a pricing calculator for cost estimation, a data backup and restore process for enhanced data security, a customizable timezone setting for global users, a collection rename tool for better organization, the removal of storage quotas for unrestricted usage, and improved credit conservation for inactive databases. | Cloud"
type: origin
token: ZvSOwB7zkir7PjkzrOPciC5WnTe
sidebar_position: 18
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source

---

import Admonition from '@theme/Admonition';


# Release Notes (April 6, 2023)

We're thrilled to unveil the newest Zilliz Cloud update, featuring a pricing calculator for cost estimation, a data backup and restore process for enhanced data security, a customizable timezone setting for global users, a collection rename tool for better organization, the removal of storage quotas for unrestricted usage, and improved credit conservation for inactive databases.

- Pricing Calculator

    We are excited to announce the launch of our new feature - Pricing Calculator. This new feature is designed to help our users plan and estimate their costs effectively. With the Pricing Calculator, users can easily select their CU type, enter their number of entities and vector dimensions, and get recommended CU size and cost estimates of Zilliz Cloud. [Click here](https://zilliz.com/pricing#calculator) to try it out.

    Our Pricing Calculator only supports vector data now, and we plan to expand its capabilities to include scalar data in the future, providing even more accurate cost estimates for our users.

- Backup and Restore on GCP

    With this release, our platform now supports database backup and restore on Google Cloud Platform (GCP). This latest release enables our users to easily backup and restore their databases on GCP, ensuring data recovery and business continuity.

    For details, refer to [Backup & Restore](./backup-and-restore).

- Custom Timezone

    We have added support for timezone settings, enabling users to customize their timezone preferences and ensure accurate timestamps on all their data.

    For details, refer to [Manage Timezone](./organization-settings#manage-timezone).

- Collection Rename

    We are pleased to announce that our latest release includes a new feature that enables users to rename database collections. This feature is designed to help users better manage their database structure and make necessary changes without having to create new collections and migrate data.

- Removal of storage quota

    With this release, we have removed the storage quota from our platform. This means that users can now import data into an unloaded collection without having to worry about storage limits. Although there is no limit to data storage, the load capacity of each database is dependent on the size of the database. We strongly recommend that you use the Pricing Calculator to choose a suitable database size.

    In addition, we have also improved our user notifications when a database cannot fit into the pre-allocated CUs. Users will receive a notification when their database is beyond capacity. This will help users to better understand why their data failed to be imported and allow them to take appropriate actions.

- Improved credit-saving for inactive databases

    We have optimized the product logic and reminder notifications of inactive databases. If a user's database has been inactive for 14 consecutive days, we will automatically stop the database for the user to help save their free credits. Data security is always our top priority, so we will not delete any data from inactive databases. Users whose databases have been stopped can resume them at any time. In addition, we have updated our Terms of Service to include this optimization.

- Other Improvements

    - Improved UI of Billing.

    - Updated the naming for CU types - "High Performance" is now named "Performance-optimized" and "Big Data" is named "Capacity-optimized".

