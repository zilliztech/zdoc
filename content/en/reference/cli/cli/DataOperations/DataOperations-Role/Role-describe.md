---
title: "describe | Cloud"
slug: /cli/cli/Role-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets details and privileges of a role. | Cloud"
type: docx
token: Fj9Yd4SOPoppxTx7K8WcyMd7ncd
sidebar_position: 2
keywords: 
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

This operation gets details and privileges of a role.

<Admonition type="info" icon="📘" title="Notes">

This command is available for Dedicated clusters only. You can run `zilliz context set` to switch among clusters.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz role describe
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--database <value>]
```

**OPTIONS:**

- **--role** (*string*) -

    **[REQUIRED]**

    Indicates the role name.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when the output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

- **--database** (*string*) -

    Indicates a database name. The value defaults to `default`.

## Example\{#example}

```bash
zilliz role describe --role my_role
```
