---
displayed_sidbar: cliSidebar
title: "compact | Cloud"
slug: /cli/cli/Collection-compact
sidebar_label: "compact"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation compacts collection segments to optimize storage. | Cloud"
type: docx
token: KYOydyGRaoMchUxkS0ucd8VUnve
sidebar_position: 1
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - compact
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# compact

This operation compacts collection segments to optimize storage.

## Description

Zilliz Cloud automatically compacts collection segments at intervals. In most cases, you do not need to run this command manually unless you need to optimize storage in the collection.

Clustering compaction is designed to improve search performance and reduce costs in large collections. This guide will help you understand clustering compaction and how this feature can improve search performance. Unlike normal compaction, clustering compaction redistributes entities within a collection's segments based on values in a scalar field.

Running this command without any options triggers a set of interactive prompts to help you set it up.

## Synopsis

```bash
zilliz collection compact
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--clustering]
```

## Options

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the collection name. You can run `zilliz collection list` to obtain the list of all existing collections.

- **--database** (*string*) -

    Indicates the database name.

    If a cluster is configured using `zilliz context set`, the database it belongs automatically applies if this option is left unconfigured.

- **--output, -o** (*string*) -

    Indicates the output format. Choices: `json`, `table`, `text`, `yaml`, `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when the output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

- **--clustering** (*boolean*) -

    Indicates whether to perform clustering compaction.

## Example

```bash
zilliz collection compact --name my_collection
```
