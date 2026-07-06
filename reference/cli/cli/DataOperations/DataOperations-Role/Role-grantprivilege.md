---
title: "grant-privilege | Cloud"
slug: /cli/cli/Role-grantprivilege
sidebar_label: "grant-privilege"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation grants a privilege to a role. | Cloud"
type: docx
token: U83ddOym4o7WgAx1ekac4nFHnzf
sidebar_position: 4
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - grant-privilege
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# grant-privilege

This operation grants a privilege to a role.

## Description\{#description}

A **privilege** refers to the permission of specific operations on certain Zilliz Cloud resources such as clusters, databases, and collections. Privileges are assigned to roles, which are then granted to users, defining the operations users can perform on the resources. An example of a privilege could be the permission to insert data into a collection named `collection_01`.

A **privilege group** is a combination of individual privileges. You can create a privilege group of commonly used privileges to simplify the role-granting process. For ease of use, Zilliz Cloud provides 9 built-in privilege groups at the collection, database, and cluster levels.

Possible privileges are listed on [Privileges and Privilege Groups](/docs/cluster-privileges).

<Admonition type="info" icon="📘" title="Notes">

This command is available for Dedicated clusters only. You can run `zilliz context set` to switch among clusters.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz role grant-privilege
--role <value>
--object-type <Global | Collection | Database>
--object-name <value>
--privilege <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--role** (*string*) -

    **[REQUIRED]**

    Indicates the role name.

- **--object-type** (*string*) -

    **[REQUIRED]**

    Indicates the object type. Possible values:

    - `Global`,

    - `Collection`,

    - `Database`.

- **--object-name** (*string*) -

    **[REQUIRED]**

    Indicates the object name. You can use a `'*'` to include all objects of the specified type.

- **--privilege** (*string*) -

    **[REQUIRED]**

    Indicates the privilege name. You can use `'*'` to include all privileges. Possible privileges are listed on [Privileges and Privilege Groups](/docs/cluster-privileges).

- **--database** (*string*) -

    Indicates the database name.

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

## Example\{#example}

```bash
# Grant search on a specific collection
zilliz role grant-privilege --role my_role --object-type Collection --object-name my_col --privilege Search

# Grant all privileges on all collections
zilliz role grant-privilege --role my_role --object-type Collection --object-name '*' --privilege '*'
```
