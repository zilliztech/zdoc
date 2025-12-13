---
title: "Release Notes (Dec 5, 2022) | Cloud"
slug: /release-notes-009
sidebar_label: "Release Notes (Dec 5, 2022)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "We are pleased to announce the general availability of a significant update to Zilliz Cloud. This release introduces a new console for Zilliz Cloud services, supports new cloud regions, and allows secure cluster access through private links. | Cloud"
type: origin
token: QZXVwFVH3i1p08kal8vcAmmxnie
sidebar_position: 30
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search

---

import Admonition from '@theme/Admonition';


# Release Notes (Dec 5, 2022)

We are pleased to announce the general availability of a significant update to Zilliz Cloud. This release introduces a new console for Zilliz Cloud services, supports new cloud regions, and allows secure cluster access through private links.

- New UI for Zilliz Cloud services

    With this release, we are pleased to introduce the new UI for Zilliz Cloud. A tree-based navigation structure in the brand-new UI offers you much more intuitive guidance. All the functionalities are organized into five categories:

    All these functions are now available in a 90-day free trial on Zilliz Cloud. [Try Now!](https://cloud.zilliz.com/)

- Support AWS region **US-East-2**

    We are pleased to announce that Zilliz Cloud now supports service deployment on a new AWS region **US-East-2**. Currently, the supported regions are AWS **US-West-2** and **US-East-2**.

- Private link

    Private link provides a private connection from your application to a database. The private link solution caters to the need for private, more secure, and more efficient connectivity to Zilliz Cloud services.

    To set up a database connection with a private link, you need to register your VPC endpoint with Zilliz Cloud to create a private link and map the link to the DNS name of the endpoint. 

    For details, refer to [Set up a Private Link](./setup-a-private-link).

- Data import from large files

    We are pleased to announce that Zilliz Cloud now supports data import from large files. You can bulk-insert data into your collection from a file up to 512 MB. The files can be located either in an S3 bucket or on your local disk.

    For details, refer to [Data Import](./data-import).