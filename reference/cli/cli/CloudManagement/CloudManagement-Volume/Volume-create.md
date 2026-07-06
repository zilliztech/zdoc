---
title: "create | Cloud"
slug: /cli/cli/Volume-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a new volume. | Cloud"
type: docx
token: H86odvFbDomzPjxjOtCc75jDnGf
sidebar_position: 1
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

This operation creates a new volume.

## Description\{#description}

A volume is an object store that holds either structured data or collections of unstructured data files. It provides a unified place to access, store, govern, and organize these data assets. Structured and unstructured data from local file systems or cloud object storage are first uploaded into a volume in Zilliz Cloud. From there, you can import or migrate structured data directly into collections, or run ETL pipelines to transform unstructured data into embeddings and then load those embeddings into collections.

Running this command without any options triggers a set of interactive prompots for you to set up the command.

## Synopsis\{#synopsis}

```bash
zilliz volume create
--project-id <value>
--region <value>
--name <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--project-id** (*string*) -

    **[REQUIRED]**

    Indicates a project ID.

    If a project is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--region** (*string*) -

    **[REQUIRED]**

    Indicates a cloud region. For example, `aws-us-west-2`.

    Possible values:

    - `aws-us-east-1`

    - `aws-us-east-2`

    - `aws-us-west-2`

    - `aws-ca-central-1`

    - `aws-eu-central-1`

    - `aws-eu-west-1`

    - `aws-ap-northeast-1`

    - `aws-ap-southeast-1`

    - `aws-ap-southeast-2`

    - `gcp-us-west1`

    - `gcp-us-east4`

    - `gcp-us-central1`

    - `gcp-asia-southeast1`

    - `az-eastus`

    - `az-eastus2`

    - `az-centralus`

    - `az-germanywestcentral`

    - `az-northeurope`

    - `az-centralindia`

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates a volume name. 

    The value is an alphanumeric string of up to **255** characters that starts with a letter.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

## Example\{#example}

```bash
zilliz volume create --project-id proj-xxxx \
--region aws-us-west-2 \
--name my-volume
```
