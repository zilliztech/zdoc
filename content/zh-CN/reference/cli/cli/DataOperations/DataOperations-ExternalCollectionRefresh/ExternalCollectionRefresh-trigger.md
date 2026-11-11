---
title: "trigger | Cloud"
slug: /cli/cli/ExternalCollectionRefresh-trigger
sidebar_label: "trigger"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会为外部 Collection 触发一个刷新作业。返回作业 ID。 | Cloud"
type: docx
token: ApSLdblNKo7ru0xGTqbconxBnSh
sidebar_position: 3
keywords: 
  - OpenAI 向量数据库
  - 自然语言处理 Database
  - 低成本向量 Database
  - 托管式向量 Database
  - zilliz
  - zilliz cloud
  - cloud
  - trigger
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# trigger

此操作会为外部 Collection 触发一个刷新作业。返回作业 ID。

## 描述\{#description}

在当前集群上下文中为外部 Collection 启动一个刷新作业。使用返回的 `jobId`，通过 `zilliz external-collection refresh describe` 检查该作业。

## 概要\{#synopsis}

```bash
zilliz external-collection refresh trigger
--name <value>
[--database <value>]
[--external-source <value>]
[--external-spec <value>]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必填]**

    指定外部 Collection 名称。

- **--database** (*string*) -

    指定 Database 名称。

- **--external-source** (*string*) -

    指定本次刷新使用的外部源 URI。

    请将其与 `--external-spec` 一起提供，或同时省略两者；当两者都省略时，刷新会复用已持久化的外部源和规范。

    该选项接受两种方案：`volume://<volume_name>/<path>` 和 `milvus://<instance_id>/<db_name>/<collection_name>`。对于 `volume://` URI，适用上述规则。对于 `milvus://` 源，此选项为必填；如果省略，刷新不会生效，Collection 会继续提供先前已同步的数据。

- **--external-spec** (*string*) -

    以 JSON 字符串形式指定本次刷新的外部源规范。请将其与 `--external-source` 一起提供，或同时省略两者。

    对于 `milvus://` 源，您可以省略此选项；`format` 默认为 `milvus-table`。

## 示例\{#example}

```bash
# Trigger refresh for an external collection
zilliz external-collection refresh trigger --name my_external_coll

# Example output
# {
#   "jobId": 123456
# }

# Trigger refresh in a non-default database
zilliz external-collection refresh trigger --name my_external_coll --database my_db
# next-channel-start

# Trigger refresh for an external collection that uses a milvus:// source
zilliz external-collection refresh trigger --name my_external_coll --external-source milvus://in01-xxxx/default/orders
# next-channel-end
```
