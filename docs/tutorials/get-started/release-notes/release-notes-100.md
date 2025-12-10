---
title: "Release Notes (March 6, 2023) | Cloud"
slug: /release-notes-100
sidebar_label: "Release Notes (March 6, 2023)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "We are pleased to announce the general availability of a significant update to Zilliz Cloud. This release raises the standard of vector database services for usability, security, performance, and capability to a new stage, bringing you a state-of-the-art vector database experience built for everyone. | Cloud"
type: origin
token: XmUYwRgNDitesQkl9QDc3IslnOh
sidebar_position: 27
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database

---

import Admonition from '@theme/Admonition';


# Release Notes (March 6, 2023)

We are pleased to announce the general availability of a significant update to Zilliz Cloud. This release raises the standard of vector database services for usability, security, performance, and capability to a new stage, bringing you a state-of-the-art vector database experience built for everyone.

- Billion-scale Vector Collection Support

    With this release, Zilliz Cloud has pushed the capacity limit of vector databases to a billion-scale. Now enterprise users can create [32 CU database instances](https://zilliz.com/pricing) (for both performance-optimized CU and capacity-optimized CU) through the Zilliz Cloud web interface.

    For users who require larger instances for PoC or production deployment, please don’t hesitate to [contact us](https://zilliz.com/contact-sales) to obtain instances up to 256 performance-optimized CUs (which can serve 1.3 billion 128-dimensional vectors) or 128 capacity-optimized CUs (which can serve 3 billion 128-dimensional vectors).

- Performance Improvements

    This updated version of Zilliz Cloud is built based on Milvus 2.2.3. With Milvus 2.2.3, we achieved a 2.5x reduction in search latency compared to the original Milvus 2.0.0 release. Lower latency benefits all users but is key when dealing with real-time information retrieval systems such as recommendation systems, image/video/text search, and question answering.

    Our testing under an identical environment showed a 4.5x increase in QPS with Milvus 2.2.3 compared to 2.0.0. Due to this increase, Milvus is now even more hardware and cost-efficient, which is critical in building large-scale vector search platforms.

    For more details, please see our [white paper](https://zilliz.com/resources/milvus-performance-benchmark).

- Zilliz Cloud on GCP

    We are pleased to announce that Zilliz Cloud is now available on Google Cloud Platform (GCP). Zilliz Cloud offers the best experience and meets the diverse requirements of various users, ranging from startups to large enterprises. You can deploy managed vector database instances on GCP with just a few clicks.

    The us-west1 region (The Dalles, Oregon) is now available. The cost per CU for our services on GCP is $0.215 per hour for both performance-optimized and capacity-optimized types, and the storage cost is $0.02/GB per month.

- AWS Marketplace

    Zilliz Cloud is likewise available on the [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio), making it easier than ever to access our fully managed vector database services on AWS. This integration couldn’t come at a better time as demand for AI applications grows. With Zilliz Cloud on AWS Marketplace, users can quickly build and scale their AI applications.

    One of the benefits of this integration is the ability to manage products seamlessly. Billing, cancellations, refunds, and more can all be governed and tracked on your user’s AWS account. This feature alone saves you time and hassle, streamlining the entire process.

    Another advantage is the ability to view costs through AWS Cost Explorer. This tool lets you easily track expenses and gain insight into billing and cost management processes.

    For details, refer to [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace).

- Rolling Upgrade

    Milvus users have had to perform various maintenance tasks periodically to ensure system health. However, maintenance work on a production system can be risky. Typically, maintenance work is performed during scheduled downtime, which requires taking the database offline and suspending normal business operations. Unfortunately, today’s users are intolerant of prolonged periods of downtime.

    The good news is that Zilliz Cloud now supports rolling upgrades. With your vector databases deployed on Zilliz Cloud, you no longer need to worry about scheduled maintenance. Instead, set up a maintenance window and focus on your business while we handle the rest. In most cases, service downtime due to the rolling upgrade will be less than 1 minute per month.

- Backup and Restore

    The Backup and Restore feature is now available with Zilliz Cloud. Data loss can happen to anyone at any time. The consequences can be devastating, whether due to a hardware failure, a software glitch, or even human error. That’s why it’s critical to have a reliable backup and recovery solution for databases in place.

    With the new backup and restore feature, you can now easily back up your database and restore it in case of an unexpected loss.

    For details, refer to [Backup & Restore](./backup-and-restore).

- Recycler Bin

    Data security is always our top priority. With this release, we are introducing the Recycler Bin on Zilliz Cloud, which makes your data even safer. For example, suppose your users drop your databases or automatically delete them due to prolonged inactivity in free trials or service suspension due to outstanding fees. In that case, Zilliz cloud will automatically move your database/collection to the recycler bin, and you can recover the data any time in the next 30 days.

    For details, refer to [Use Recycle Bin](./use-recycle-bin).

- Database Migration from Open Source Milvus

    With this release, we are introducing database migration toolkits. Now open-source Milvus users can easily migrate their local databases to Zilliz Cloud, freeing themselves from the burden of system maintenance. In addition, the migration tool is compatible with Milvus 1.x and 2.x. So with only two steps, you can easily migrate your database, regardless of the Milvus version, into Zilliz Cloud.

    For more details, please refer to the [Migrations](./migrations).

- Other Great updates

    The new invoice page now displays the detailed cost of different resource usage and services, how credits are used, and any applicable discount rules. Improved experience with data preview. Some bug fixes to improve stability and memory utilization.